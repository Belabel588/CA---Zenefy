import { AppNav } from "./AppNav";
import { AppLibrary } from "./AppLibrary";

export function SideBar() {
  return (
    <div className="side-bar">
      <h1>SideBar</h1>
      <AppNav />
      <AppLibrary />

    </div>
  )
}