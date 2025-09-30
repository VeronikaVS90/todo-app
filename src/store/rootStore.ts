import { makeAutoObservable } from "mobx";

export class UIStore {
  darkMode = false;

  constructor() {
    makeAutoObservable(this);
    const saved = localStorage.getItem("ui.darkMode");
    if (saved) this.darkMode = saved === "true";
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    localStorage.setItem("ui.darkMode", String(this.darkMode));
  }
}

export default class RootStore {
  ui: UIStore;

  constructor() {
    this.ui = new UIStore();
  }
}
