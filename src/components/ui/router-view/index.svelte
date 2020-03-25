<script lang="ts">
  import { routerLinkStore } from '../router-link/store';
  import Page404 from '@/pages/404/index.svelte';
  import Page from 'page';

  let Component;
  const { currentComponentUri$ } = routerLinkStore;
  export let hashbang: boolean = true;
  let menuPath: string;
  Page.start({
    hashbang,
  });

  const loadComponent = (uri: string) => {
    if (uri && uri.length > 0) {
      import(`@/${uri}`)
        .then((res) => {
          const { default: com } = res;
          Component = com;
        })
        .catch((error) => {
          Component = Page404;
        });
    }
  };

  export const show = (path: string) => {
    currentComponentUri$.next(`modules/${path}/index.svelte`);
  };
  // @ts-ignore
  $: {
    // @ts-ignore
    const uri = $currentComponentUri$;
    menuPath = uri.replace('modules/', '').replace('/index.svelte', '');
    loadComponent(uri);
  }
</script>

<svelte:component this={Component} {menuPath} />
