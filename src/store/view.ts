import { menuStore } from '@/store/menu';
import { T } from '@/assets/js/locale/locale';
import { StringUtil } from '@/assets/js/string-util';
import { BehaviorSubject, forkJoin, Observable, of, Subscription } from 'rxjs';
import { tableUtilStore } from '@/store/table-util';
import { catchError, concatMap, filter, first, skip, switchMap, take } from 'rxjs/operators';
import { App } from '@/assets/js/constants';
import { AxiosResponse } from 'axios';
import { PayloadRes, RoleControl } from '@/model/base';
import gql from 'graphql-tag';
import { Debug } from '@/assets/js/debug';
import { ButtonId, ButtonPressed } from '@/components/ui/button/types';
import { menuControlStore } from '@/store/menu-control';
import { getDiffFieldsObject, SObject } from '@/assets/js/sobject';
import { SDate } from '@/assets/js/sdate';
import { Language } from '@/modules/sys/language/model';
import { fromPromise } from 'rxjs/internal-compatibility';
import Form from '@/assets/js/form/form';

export class ViewStore {
  tableName: string;
  columns: string[] = ['name'];
  orderBy: string[] = ['updated_or_created_date desc nulls last, name'];
  trashRestoreColumns: string[] = ['name'];
  page = 1;
  pageSize = App.DEFAULT_PAGE_SIZE;
  onlyMe = false;
  includeDisabled = true;
  fullCount$ = new BehaviorSubject<number>(null);
  loading$ = new BehaviorSubject<boolean>(false);
  saveRunning$ = new BehaviorSubject<boolean>(false);
  deleteRunning$ = new BehaviorSubject<boolean>(false);

  isReadOnlyMode$ = new BehaviorSubject<boolean>(false); // true: form can edit, false form disable
  isUpdateMode$ = new BehaviorSubject<boolean>(false); // true: update mode, false: save mode
  dataList$ = new BehaviorSubject<any[]>([]);
  hasAnyDeletedRecord$ = new BehaviorSubject<boolean>(false);
  roleControls: RoleControl[];
  fullControl: boolean;

  needSelectId$ = new BehaviorSubject<string>(null);
  needHighlightId$ = new BehaviorSubject<string>(null);

  selectedData$ = new BehaviorSubject<any>(null);
  // selectedData: any = undefined;

  completeLoading$ = forkJoin([
    this.dataList$.pipe(
      skip(1),
      catchError((error) => of([])),
      first(),
    ),
  ]);

  constructor(public menuPath: string) {}

  getViewTitle = () => {
    return T(`COMMON.MENU.${menuStore.selectedData && menuStore.selectedData.menuName}`);
  };

  getViewName = () => {
    return StringUtil.toTitleCase(menuStore.selectedData && menuStore.selectedData.menuName);
  };

  getSimpleList = (textSearch = '') => {
    tableUtilStore
      .getSimpleList({
        tableName: this.tableName,
        columns: this.columns.join(','),
        orderBy: this.orderBy.join(','),
        textSearch: textSearch,
        page: this.page,
        pageSize: this.pageSize,
        onlyMe: this.onlyMe,
        includeDisabled: this.includeDisabled,
      })
      .pipe(take(1))
      .subscribe((res: AxiosResponse) => {
        const data: PayloadRes = res.data;
        this.dataList$.next(data.payload);
        this.fullCount$.next(data.fullCount);
      });
  };

  createWorkListColumns = () => {
    return this.columns
      .filter((it) => it !== 'id' && it !== 'sort')
      .map((it) => {
        return {
          name: it,
          title: T(`COMMON.LABEL.${it}`),
        };
      });
  };

  createWorkListColumnsForHandsonTable = () => {
    return this.columns.map((it) => {
      return {
        hidden: it !== 'id' && it !== 'sort' ? false : true,
        name: it,
        title: T(`COMMON.LABEL.${it}`),
      };
    });
  };

  createQuerySubscription = (withVar: boolean = false) => {
    const query = gql`
      subscription ${this.tableName}Subscription ${withVar ? '($id: bigint!, $updatedBy: bigint!)' : ''} {
        ${this.tableName} ${
      withVar ? '(where: {_and: [ {id: { _eq: $id }}, {updated_by: { _neq: $updatedBy }}]})' : ''
    } {
          id
          ${this.columns.map((it) => it + '\n')}
          updatedBy: updated_by
          updatedDate: updated_date
          disabled
          deletedBy: deleted_by
          deletedDate: deleted_date
        }
      }
    `;
    return query;
  };

  // Begin control state
  isDisabled = (controlCode: string, hasError: boolean = false) => {
    if (hasError) {
      return true;
    }
    if (this.fullControl) {
      return false;
    } else {
      if (!this.roleControls) return true;
      return (
        this.roleControls.filter((item: any) => item.controlCode === controlCode && item.disableControl === false)
          .length === 0
      );
    }
  };

  isRendered = (controlCode: string, isRendered: boolean = true) => {
    if (!isRendered) {
      return false;
    }

    if (this.fullControl) {
      return true;
    } else {
      if (!this.roleControls) return false;

      return (
        this.roleControls.filter((item: any) => item.controlCode === controlCode && item.renderControl === true)
          .length > 0
      );
    }
  };

  hasPermission = (event: any) => {
    let eleId = null;
    if (typeof event === 'object') {
      if (StringUtil.isEmpty(event.currentTarget.id)) {
        Debug.errorSection('hasPermission', `ID of ${event.currentTarget} was not set`);
        return false;
      }
      eleId = event.currentTarget.id;
    } else {
      eleId = event;
    }
    return !this.isDisabled(eleId);
  };

  checkControlProperty = (event: any, property: string) => {
    let eleId = null;
    if (typeof event === 'object') {
      if (StringUtil.isEmpty(event.currentTarget.id)) {
        Debug.errorSection(property, `ID of ${event.currentTarget} was not set`);
        return false;
      }
      eleId = event.currentTarget.id;
    } else {
      eleId = event;
    }

    if (!this.fullControl) {
      if (this.roleControls.filter((item: any) => item.controlCode === eleId && item[property] === false).length > 0) {
        return false;
      }
    } else {
      return false;
    }

    return true;
  };

  requirePassword = (event: any) => {
    return this.checkControlProperty(event, 'requirePassword');
  };

  confirm = (event: any) => {
    return this.checkControlProperty(event, 'confirm');
  };

  verifyAction = (id: string, confirmCallback: Function, passwordConfirmModal: any) => {
    return new Promise((resolve, reject) => {
      if (StringUtil.isEmpty(id)) {
        Debug.errorSection('Verify Action', 'ID not defined');
        reject('fail');
      }
      // check permission
      if (!this.hasPermission(id)) {
        reject('fail');
      }

      // confirm
      if (confirmCallback && this.confirm(id)) {
        confirmCallback().then((confirmButtonPressed: ButtonPressed) => {
          if (confirmButtonPressed === ButtonPressed.OK) {
            if (this.requirePassword(id)) {
              passwordConfirmModal &&
                passwordConfirmModal.show().then((buttonPressed: ButtonPressed) => {
                  if (buttonPressed === ButtonPressed.OK) {
                    resolve('ok');
                  } else {
                    reject('fail');
                  }
                });
            } else {
              resolve('ok');
            }
          } else {
            reject('fail');
          }
        });
      } else {
        // no confirm
        if (this.requirePassword(id)) {
          passwordConfirmModal &&
            passwordConfirmModal.show().then((buttonPressed: ButtonPressed) => {
              if (buttonPressed === ButtonPressed.OK) {
                resolve('ok');
              } else {
                reject('fail');
              }
            });
        } else {
          resolve('ok');
        }
      }
    });
  };

  verifySimpleAction = (
    buttonId: string,
    confirmModalRef: any,
    passwordConfirmModalRef: any,
    msg: string,
    extraMessage: string = '',
  ) => {
    return this.verifyAction(
      buttonId,
      () => confirmModalRef.show(`${T(`COMMON.MSG.${msg}`)} <b>${extraMessage}</b>. ${T('COMMON.MSG.ARE_YOU_SURE')}?`),
      passwordConfirmModalRef,
    );
  };

  verifyAddNewAction = (
    buttonId: string,
    confirmModalRef: any,
    passwordConfirmModalRef: any,
    extraMessage: string = '',
  ) => {
    return this.verifySimpleAction(buttonId, confirmModalRef, passwordConfirmModalRef, 'ADD_NEW', extraMessage);
  };

  verifySaveAction = (
    buttonId: string,
    confirmModalRef: any,
    passwordConfirmModalRef: any,
    extraMessage: string = '',
  ) => {
    return this.verifySimpleAction(buttonId, confirmModalRef, passwordConfirmModalRef, 'SAVE', extraMessage);
  };

  verifyEditAction = (
    buttonId: string,
    confirmModalRef: any,
    passwordConfirmModalRef: any,
    extraMessage: string = '',
  ) => {
    return this.verifySimpleAction(buttonId, confirmModalRef, passwordConfirmModalRef, 'EDIT', extraMessage);
  };

  verifyUpdateAction = (
    buttonId: string,
    confirmModalRef: any,
    passwordConfirmModalRef: any,
    extraMessage: string = '',
  ) => {
    return this.verifySimpleAction(buttonId, confirmModalRef, passwordConfirmModalRef, 'UPDATE', extraMessage);
  };

  verifyDeleteAction = (
    buttonId: string,
    confirmModalRef: any,
    passwordConfirmModalRef: any,
    extraMessage: string = '',
  ) => {
    return this.verifySimpleAction(buttonId, confirmModalRef, passwordConfirmModalRef, 'DELETE', extraMessage);
  };

  checkObjectArrayChange = (beforeData: any, currentData: any, snackbar: any = undefined) => {
    let changedObject = SObject.getDiffRowObjectArray(beforeData, currentData);

    if (SObject.isEmptyField(changedObject)) {
      if (snackbar) {
        snackbar.showNoDataChange();
      }

      return true;
    }
    return changedObject;
  };

  checkObjectChange = (beforeData: any, currentData: any, snackbar: any = undefined) => {
    let changedObject = getDiffFieldsObject(beforeData, currentData);

    if (SObject.isEmptyField(changedObject)) {
      if (snackbar) {
        snackbar.showNoDataChange();
      }
      return null;
    }
    return changedObject;
  };

  showViewConfigModal = (
    buttonId: string,
    confirmModalRef: any,
    confirmPasswordModalRef: any,
    configModalRef: any,
    snackbarRef: any,
  ) => {
    const confirmCallback = () => {
      return confirmModalRef.show(`${T('COMMON.MSG.SHOW_VIEW_CONFIG')}. ${T('COMMON.MSG.ARE_YOU_SURE')}?`);
    };

    this.verifyAction(buttonId, confirmCallback, confirmPasswordModalRef).then((_) => {
      menuControlStore.sysGetControlListByMenuPath(this.menuPath).then((data: any) => {
        configModalRef.show(data).then((buttonPressed: ButtonPressed) => {
          if (buttonPressed === ButtonPressed.OK) {
            const newData = configModalRef.getData();
            let dataChanged = this.checkObjectArrayChange(data, newData, snackbarRef);
            if (typeof dataChanged !== 'boolean') {
              dataChanged = dataChanged.filter(
                (item: any) => item.code !== 'btnConfig' || (item.code === 'btnConfig' && item.checked),
              );
              if (dataChanged.length > 0) {
                menuControlStore
                  .saveOrUpdateOrDelete({
                    menuPath: this.menuPath,
                    menuControls: dataChanged,
                  })
                  .then((_: any) => {
                    location.reload();
                  });
              }
            }
          }
        });
      });
    });
  };

  showTrashRestoreModal = (
    buttonId: string,
    onlyMe: boolean,
    confirmModalRef: any,
    confirmPasswordModalRef: any,
    trashRestoreModalRef: any,
    snackbarRef: any,
  ) => {
    this.verifyAction(
      buttonId,
      () => {
        confirmModalRef.show(`${T('COMMON.MSG.SHOW_TRUSH_RESTORE')}. ${T('COMMON.MSG.ARE_YOU_SURE')}?`);
      },
      confirmPasswordModalRef,
    ).then(() => {
      this.doShowTrashRestoreModal(onlyMe, trashRestoreModalRef, snackbarRef);
    });
  };

  doShowTrashRestoreModal = (onlyMe: boolean, trashRestoreModalRef: any, snackbarRef: any) => {
    tableUtilStore.getAllDeletedRecords(this.tableName, this.trashRestoreColumns, onlyMe).then((res: any) => {
      const newData = res
        ? res.map((item: any, index: any) => {
            item.restore = false;
            item.foreverDelete = false;
            item.deletedDate = SDate.convertMilisecondToDateTimeString(item.deletedDate);
            return item;
          })
        : [];

      trashRestoreModalRef.show(newData).then((buttonPressed: ButtonPressed) => {
        if (buttonPressed === ButtonPressed.OK) {
          const newData = trashRestoreModalRef.getData();
          if (newData && newData.length > 0) {
            const filter = newData
              .filter((item: any) => item.restore === true || item.foreverDelete === true)
              .map((item: any) => {
                delete item.deletedBy;
                delete item.deletedDate;
                return item;
              });
            if (filter && filter.length > 0) {
              const deletedIds = filter
                .filter((item: any) => item.foreverDelete === true)
                .map((it: any) => it.id)
                .join(',');

              const restoreIds = filter
                .filter((item: any) => item.restore === true)
                .map((it: any) => it.id)
                .join(',');

              tableUtilStore.restoreOrForeverDelete(this.tableName, deletedIds, restoreIds).then(() => {
                if (deletedIds && deletedIds.split(',').length === newData.length) {
                  snackbarRef.showTrashEmpty();
                } else {
                  if (restoreIds) {
                    snackbarRef.showTrashRestoreSuccess();
                  }
                }
              });
            } else {
              snackbarRef.showNoDataChange();
            }
          }
        }
      });
    });
  };

  checkDeletedRecord = (onlyMe: boolean) => {
    tableUtilStore.hasAnyDeletedRecord(this.tableName, onlyMe).then((data: any) => {
      if (data.length > 0) {
        this.hasAnyDeletedRecord$.next(data[0].exists);
      }
    });
  };

  getOneById = (id: string) => {
    return tableUtilStore.getOneById(this.tableName, id);
    // .pipe(take(1))
    // .subscribe({
    //   next: (res) => {
    //     if (res.data && res.data.length > 0) {
    //       this.selectedData = res.data[0];
    //       this.selectedData$.next(res.data[0]);
    //     }
    //   },
    //   error: (err) => {
    //     console.log(err);
    //   },
    // });
  };

  doDelete = (id: string, snackbarRef: any, doAddNew: Function) => {
    this.deleteRunning$.next(true);
    tableUtilStore
      .softDeleteMany(this.tableName, [id])
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          snackbarRef.showDeleteSuccess(res.data + ' ' + T('COMMON.LABEL.RECORD'));
        },
        error: (err: Error) => {
          snackbarRef.show(err.message);
        },
        complete: () => {
          doAddNew();
          this.deleteRunning$.next(false);
        },
      });
  };
}
