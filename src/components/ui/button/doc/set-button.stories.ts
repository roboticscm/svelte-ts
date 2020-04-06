import '../../../../../public/global.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { storiesOf } from '@storybook/svelte';

import SetButton from './set-button.svelte';
// import Readme from './readme.md';

const Readme = require('./readme.md').default;

storiesOf('Buttons | Overview', module)
  //Simple Button
  .add(
    'Overview',
    () => ({
      Component: SetButton,
    }),
    { notes: { markdown: Readme } },
  );
