import { menuStore } from '@/store/menu';
import { T } from '@/assets/js/locale/locale';
import { StringUtil } from '@/assets/js/string-util';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { tableUtilStore } from '@/store/table-util';
import { catchError, first, skip, take } from 'rxjs/operators';
import { App } from '@/assets/js/constants';
import { AxiosResponse } from 'axios';
import { PayloadRes, RoleControl } from '@/model/base';
import gql from 'graphql-tag';
import { Debug } from '@/assets/js/debug';
import { ButtonPressed } from '@/components/ui/button/types';
import { menuControlStore } from '@/store/menu-control';
import { SObject } from '@/assets/js/sobject';

export class ViewStore {
  tableName: string;
  columns: string[] = ['name'];
  orderBy: string[] = ['updated_date desc, created_date desc, name'];
  page = 1;
  pageSize = App.DEFAULT_PAGE_SIZE;
  onlyMe = false;
  includeDisabled = true;
  fullCount: number;
  loading$ = new BehaviorSubject<boolean>(false);
  saveRunning = false;
  deleteRunning = false;

  isReadOnlyMode = false; // true: form can edit, false form disable
  isUpdateMode = false; // true: update mode, false: save mode

  dataList$ = new BehaviorSubject<any[]>([]);

  roleControls: RoleControl[];
  fullControl: boolean;

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

  getMenu = () => {
    return menuStore.selectedData;
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
        this.fullCount = data.fullCount;
      });
  };

  createColumns = () => {
    return this.columns
      .filter((it) => it !== 'id' && it !== 'sort')
      .map((it) => {
        return {
          name: it,
          title: T(`COMMON.LABEL.${it}`),
        };
      });
  };

  createQuerySubscription = () => {
    const query = gql`
      subscription LangSubscription {
        language {
          id
          ${this.columns.map((it) => it + '\n')}
          updated_by
          updated_date
          disabled
          deleted_by
          deleted_date
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

  checkForNoDataChange = (beforeData: any, currentData: any, snackbar: any) => {
    let changedObject = SObject.getDiffRowObjectArray(beforeData, currentData);

    if (SObject.isEmptyField(changedObject)) {
      snackbar.showNoDataChange();
      return true;
    }

    return changedObject;
  };

  showViewConfigModal = (
    buttonId: string,
    confirmModalRef: any,
    passwordConfirmModalRef: any,
    configModalRef: any,
    snackbarRef: any,
  ) => {
    const confirmCallback = () => {
      return confirmModalRef.show(`${T('COMMON.MSG.SHOW_VIEW_CONFIG')}. ${T('COMMON.MSG.ARE_YOU_SURE')}?`);
    };


    this.verifyAction(buttonId, confirmCallback, passwordConfirmModalRef).then ((_) => {
      menuControlStore.sysGetControlListByMenuPath(this.menuPath).then((data: any) => {
        configModalRef.show(data).then((buttonPressed: ButtonPressed) => {
          if (buttonPressed === ButtonPressed.OK) {
            const newData = configModalRef.getData();
            let dataChanged = this.checkForNoDataChange(data, newData, snackbarRef);
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
}
