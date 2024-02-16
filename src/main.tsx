import './style.css'
import "@mercuryworkshop/alicejs";

import { Route, Router } from "@mercuryworkshop/dreamland-router";

import { flex, wevenly, hcenter, col, scrolly, h100, clip, w100, borderbox, padding, gap } from "./css";
// import { Post } from "./Post";
import { auth, sendForm } from './api';
import { Account, parseStatus, state, Status, statuses } from './state';
import { Compose } from './Compose';
import { Timeline } from './Timeline';
import { ContentRenderer, Post } from './Post';



export type App = DLComponent<{
  notifs_since_id: string | null
  notifs: DLElement<NotificationView>[]
  fetchnotifs: () => void
}>
function App(this: App): DLElement<App> {
  this.css = css`
self {
  /* height: 100%; */
}

.shelf {
  justify-content: space-evenly;
  border-bottom: 1px solid var(--accent);
  
  padding-top: 10px;
  padding-bottom: 10px;
}
.shelf button {
  background-color: var(--accent);
  border: none;
  font-family: monospace;
}
`;

  this.notifs = [];

  this.mount = async () => {
    await auth();

    // this.fetchnotifs();
  };
  return (
    <div class={[flex, wevenly, clip, h100, borderbox, padding, gap]}>
      <Container class={[flex, col, padding, gap]} title="post">
        <Container class={[flex, padding, borderbox, gap]}>
          <img src={use(state.user?.avatar)} width="64" height="64" />
          <div class={[flex, col]}>
            <div>
              {use(state.user?.username)}
            </div>
            <div>
              @{use(state.user?.acct)}
            </div>
          </div>
        </Container>
        <Compose />
      </Container>
      <Container title="feed" class={[flex, col]}>
        <div class={[flex, "shelf"]}>
          <button>
            home
          </button>
          <button>
            public
          </button>
          <button>
            bubble
          </button>
          <button>
            bookmarks
          </button>
          <button>
            search
          </button>
        </div>
        <Timeline kind="bubble" />
      </Container>
      <Container class={[padding, borderbox]} title="notifications">
        <button on:click={() => this.fetchnotifs()}>notifs :3</button>
        <div class={[flex, col, scrolly, h100]}>
          {use(this.notifs)}
        </div>
      </Container>
    </div>
  )

}
App.prototype.fetchnotifs = async function() {
  let req = await fetch("/api/v1/notifications?limit=20" + (this.notifs_since_id && `&since_id=${this.notifs_since_id}` || ""));
  let notifs = await req.json();

  console.log(notifs);
  for (const notification of notifs.reverse()) {
    const { account, id, created_at, status, type } = notification;
    if (status)
      parseStatus(status);


    let view = <NotificationView notification={notification} />;

    this.notifs = [...this.notifs, view];
    this.notifs_since_id = id;
  }
}

export type Notification = {
  account: Account
  created_at: string
  id: string
  pleroma: { is_muted: boolean, is_seen: boolean }
  status: Status
  type: "mention" | "favourite" | "reblog"
};
export type NotificationView = DLComponent<{
  notification: Notification
}>
export function NotificationView(this: NotificationView) {

  let status = statuses.get(this.notification.status?.id);

  return (
    <div class={[flex]}>
      <div>
        <img src={this.notification.account.avatar} width="32" height="32" />
      </div>
      <div class={[flex, col]}>
        <div>
          {this.notification.account.acct}
          {" "}
          {this.notification.type === "favourite" && "favourited" || ""}
        </div>
        <div>

          {this.notification.type === "mention" &&
            <Post id={this.notification.status.id} timestamp={new Date} hideauthor />
            || this.notification.type === "favourite" &&
            <div>
              <ContentRenderer post={status} />
            </div>
            || ""}
        </div>
      </div>
    </div>)
}

export function Container(this: DLComponent<{ class: any, title: string }>) {
  this.css = css`
  self {
    position: relative;
    border: 1px solid var(--accent);
  }
  .pseudo{
    position: absolute;
    display: flex;
    top:0;
    left: 1em;
    transform: translateY(-50%);
  }
  .title {

    padding-left:4px;
    padding-right:4px;
    background-color: var(--surface);
    /* font-size: 15px; */
  }
  .bar {
    position: relative;
    height: 13px;
    top: 4px;

    width: 1px;
    background-color: var(--accent);
    z-order: 3;
  }
`;
  this.class ??= [];

  return (
    <div class={[...this.class, w100]}>
      {this.title &&
        <div class="pseudo">
          <div class="bar"></div>
          <div class="title">
            {this.title}
          </div>
          <div class="bar"></div>
        </div>
        || ""
      }
      {this.children}
    </div>
  )
}

function Home() {
  console.log("Ghu")
  return <div>
    asd
  </div>
}

// export const app: App = (<App />).$;

export const router = (
  <Router>
    <Route path="/" show={() => <App />} />

  </Router>
).$

document.querySelector('#app')!.appendChild(router.root);
router.route(location.pathname);
