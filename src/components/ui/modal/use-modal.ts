import { Window } from '@/assets/js/window';
import { UrlUtil } from '@/assets/js/url-util';
import { Settings } from '@/model/settings';
import { settingsStore } from '@/store/settings';
import { ModalType } from '@/components/ui/modal/types';
import { ButtonPressed } from '@/components/ui/button/types';

export const createModal = (menuPath: string, widthInPixel: number = null, heightInPixel: number = null) => {
  const state = {
    width: '',
    height: '',
    left: '',
    top: '',
    content: '',
    resolve: (ButtonPressed) => {},
  };

  const closeModal = (modalWrapperRef: any, action: ButtonPressed) => {
    if (state.resolve) {
      modalWrapperRef && modalWrapperRef.classList.remove('show-modal');
      state.resolve(action);
    }
  };

  const dragElement = (elmnt: any) => {
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    const dragMouseDown = (e: any) => {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    };
    if (document.getElementById(elmnt.id + 'header')) {
      /* if present, the header is where you move the DIV from:*/
      document.getElementById(elmnt.id + 'header').onmousedown = dragMouseDown;
    } else {
      /* otherwise, move the DIV from anywhere inside the DIV:*/
      elmnt.onmousedown = dragMouseDown;
    }

    const elementDrag = (e: any) => {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = elmnt.offsetTop - pos2 + 'px';
      elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
    };

    const closeDragElement = () => {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
    };
  };

  const saveSettings = (modalId: string, keys: string[], values: string[]) => {
    let obj = new Settings({
      menuPath,
      controlId: modalId,
      keys,
      values,
    });
    settingsStore.saveSettings(obj);
  };

  const saveModalState = (modalRef: any) => {
    if (!modalRef.style.left || modalRef.style.left.includes('-')) {
      state.left = '0';
    } else {
      state.left = modalRef.style.left;
    }

    if (!modalRef.style.top || modalRef.style.top.includes('-')) {
      state.top = '0';
    } else {
      state.top = modalRef.style.top;
    }

    state.width = modalRef.style.width;
    state.height = modalRef.style.height;

    saveSettings(modalRef.id, ['left', 'top', 'width', 'height'], [state.left, state.top, state.width, state.height]);
  };

  const loadSettings = (modalRef: any) => {
    settingsStore
      .getUserSettings(modalRef.id, menuPath)
      .then((res: any) => {
        if (res && res.length >= 4) {
          res.map((it: any) => {
            if (modalRef) {
              modalRef.style[it.key] = it.value;
            }
            return it;
          });
        } else {
          // default value for first times
          const _widthInPixel = widthInPixel ? widthInPixel : 500;
          const _heightInPixel = heightInPixel ? heightInPixel : 200;

          const pos = Window.getCenterWindowPosition(widthInPixel, heightInPixel);

          if (modalRef) {
            modalRef.style.width = `${_widthInPixel}px`;
            modalRef.style.height = `${_heightInPixel}px`;
            modalRef.style.left = `${pos.left}px`;
            modalRef.style.top = `${pos.top}px`;
          }
        }
        state.width = modalRef.style.width;
        state.height = modalRef.style.height;
      })
      .catch((error: any) => {
        console.error(error);
      });
  };

  return {
    state,
    closeModal,
    dragElement,
    saveModalState,
    loadSettings,
  };
};
