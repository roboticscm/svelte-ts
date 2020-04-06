import '../../../../../public/global.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { action } from '@storybook/addon-actions';
import Button from '../index.svelte';
import { fromEvent, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { storiesOf } from '@storybook/svelte';
import SetButton from '@/components/ui/button/doc/set-button.svelte';
import { ButtonType } from '@/components/ui/button/types';
//
// let saveRunning = false;
// const onSaveClick = (event) => {
//     saveRunning = true;
//     setTimeout(()=> {
//         saveRunning = false;
//         alert('Saved');
//     }, 1000);
// }
//
// const useUpdateAction = {
//     register(component: HTMLElement, param: any) {
//         fromEvent(component, 'click').pipe(
//             switchMap((_) => timer(1000))
//         ).subscribe(() => {
//             alert('Updated');
//         });
//     },
// };
//
// storiesOf('Button')
//     .add('Save', () => ({
//         Component: Button,
//         props: {
//             btnType: ButtonType.Save,
//             running: saveRunning,
//         },
//         on: {
//             click: onSaveClick
//         }
//     }))
