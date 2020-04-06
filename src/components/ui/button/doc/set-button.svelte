<script lang="ts">
  import Button from '../index.svelte';
  import { ButtonType, ButtonId } from '../types';
  import { fromEvent, timer } from 'rxjs';
  import { switchMap, tap } from 'rxjs/operators';

  let saveRunning = false;
  let updateRunning = false;
  const onSaveClick = (event) => {
    saveRunning = true;
    setTimeout(() => {
      saveRunning = false;
      alert('Saved');
    }, 1000);
  };

  const useUpdateAction = {
    register(component: HTMLElement, param: any) {
      fromEvent(component, 'click')
        .pipe(
          tap(() => (updateRunning = true)),
          switchMap((_) => timer(1000)),
        )
        .subscribe(() => {
          updateRunning = false;
          alert('Updated');
        });
    },
  };
</script>

<Button btnType={ButtonType.AddNew} on:click={(e) => alert('Clicked on ' + e.target.id)} />
<Button btnType={ButtonType.Edit} on:click={(e) => alert('Clicked on ' + e.target.id)} />
<Button btnType={ButtonType.Save} running={saveRunning} on:click={onSaveClick} />
<Button btnType={ButtonType.Update} running={updateRunning} action={useUpdateAction} />
<Button btnType={ButtonType.Delete} on:click={(e) => alert('Clicked on ' + e.target.id)} />
<Button btnType={ButtonType.Config} on:click={(e) => alert('Clicked on ' + e.target.id)} />
<Button btnType={ButtonType.TrashRestore} on:click={(e) => alert('Clicked on ' + e.target.innerText)} />
<Button btnType={ButtonType.CancelModal} on:click={(e) => alert('Clicked on ' + e.target.innerText)} />
<Button btnType={ButtonType.CloseModal} on:click={(e) => alert('Clicked on ' + e.target.innerText)} />
