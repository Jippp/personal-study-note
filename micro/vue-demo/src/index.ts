import { createApp } from 'vue';
import App from './App.vue';
import './index.css';

export async function bootstrap() {
  console.log('%c vue app bootstrap', 'color: red; font-size: 20px;', );
}

export async function mount(props: any) {
  console.log('%c vue app mount', 'color: red; font-size: 20px;', props);

  createApp(App).mount(props.container || '#root');
}

export async function unmount(props: any) {
  console.log('%c vue app unmount', 'color: red; font-size: 20px;', props);
}

export async function update(props: any) {
  console.log('%c vue app update', 'color: red; font-size: 20px;', props);
}

