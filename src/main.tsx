import './style.css'
import "@mercuryworkshop/alicejs";

import { flex, wevenly, hcenter, col } from "./css";
import { Post } from "./Post";
import { auth, sendForm } from './api';
import { Compose } from './Compose';
import { Timeline } from './Timeline';

const API = "/api";

export type Account = {
  [key: string]: any
  acct: string
  id: string
  url: string
  username: string
}
export type Status = {
  [key: string]: any
  created_at: string
  id: string
  account: Account
  mentions: Account[]
  reblog: Status | null
};

export type KnownStatus = Stateful<{
  object: Stateful<Status>
  key: string
}>

export const statuses: Map<string, KnownStatus> = new Map;
(window as any).a = statuses;



export type App = DLComponent<{
  notifs_since_id: string | null
  fetchnotifs: () => void
  recieveobj: (status: Status) => void
}>
function App(this: App): DLElement<App> {
  this.css = css`
self {
  height: 100%;
}
`;

  this.mount = async () => {
    await auth();

    // this.fetchnotifs();
  };
  return (
    <div class={[flex, wevenly, rule`overflow:hidden;`]}>
      <div>
        <Compose />
      </div>
      <div>
        <Timeline kind="home" />
      </div>
      <div>
        <button on:click={() => this.fetchnotifs()}>notifs :3</button>
      </div>
    </div>
  )

}
App.prototype.fetchnotifs = async function() {
  let req = await fetch("/api/v1/notifications?limit=20" + (this.notifs_since_id && `&since_id=${this.notifs_since_id}` || ""));
  let notifs = await req.json();

  console.log(notifs);
  for (const { account, id, created_at, status, type } of notifs.reverse()) {
    if (status)
      this.recieveobj(status);

    this.notifs_since_id = id;
  }
}
App.prototype.recieveobj = async function(this: App, object: Status) {
  const { id } = object;


  if (statuses.has(id)) {
    let tl = statuses.get(id)!;
    tl.object = stateful(object);
  } else {
    let withstate = stateful({
      key: id,
      object: stateful(object),
    });
    statuses.set(id, withstate);
  }
}


export const app: App = (<App />).$;
document.querySelector('#app')!.appendChild(app.root);
