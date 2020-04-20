<script lang="ts">
  import { routerLinkStore } from './store';
  import { createEventDispatcher } from 'svelte';
  import { take, skip } from 'rxjs/operators';
  import { T } from '@/lib/js/locale/locale';
  import Page from 'page';
  import { menuStore } from '@/store/menu';
  import { StringUtil } from '@/lib/js/string-util';

  // @ts-ignore
  const { currentComponentUri$ } = routerLinkStore;
  const dispatch = createEventDispatcher();

  export let __path: string = '/';
  export let activeClass: string = '';
  export let className: string = '';

  export let useFontIcon = false;
  export let fontIcon: string;
  export let iconData: string;
  export let menuName: string;

  // @ts-ignore
  $: name = T(`COMMON.MENU.${menuName}`);

  const navigate = (ctx, next) => {
    const path = ctx.path.replace('--', '/');
    const comUri = `modules${path}/index.svelte`;
    dispatch('navigate', path);

    menuStore.dataList$.pipe(skip(1), take(1)).subscribe((_) => {
      currentComponentUri$.next(comUri);
    });
  };

  Page(__path, navigate);

  const isActiveComponent = () => {
    // @ts-ignore
    const uri = StringUtil.replaceAll($currentComponentUri$, '/', '--');
    const path = __path.replace('/', '--') + '--';
    return uri.includes(path);
  };
</script>

<a href={__path} class="{className} {isActiveComponent() ? activeClass : ''}">
  {#if !useFontIcon && iconData}
    <img src={iconData} alt={name} />
  {:else}
    <span>
      {@html fontIcon || '<i class="fa fa-bars"></i>'}
    </span>
  {/if}
  {@html name}
</a>
