import './style.css'
import "@mercuryworkshop/alicejs";
import '@fontsource/poppins';
import '@fontsource-variable/rubik';
import 'iconify-icon';

import { Route, Router } from "@mercuryworkshop/dreamland-router";

import { flex, wevenly, hcenter, col, scrolly, h100, clip, w100, borderbox, padding, gap } from "./css";
// import { Post } from "./Post";
import { auth, sendForm } from './api';
import { Account, parseStatus, state, Status, statuses } from './state';
import { Compose } from './Compose';
import { Timeline } from './Timeline';
import { ContentRenderer, Post } from './Post';



const App: Component<{}, {
  notifs_since_id: string | null
  notifs: ComponentElement<typeof NotificationView>[]
  width: number
  fetchnotifs: () => void
}> = function() {
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

  this.width = window.innerWidth
  this.mount = async () => {
    await auth();


    this.fetchnotifs();
    setInterval(() => {
      this.fetchnotifs();
    }, 5000);

    window.addEventListener("resize", () => {
      this.width = window.innerWidth
    });
  };


  const notifications = (<Container class={[padding, borderbox, w100, h100]} title="notifications">
    <div class={[flex, col, scrolly, h100, w100, gap, rule`scrollbar-width: none; padding-right: 1em`]}>
      {use(this.notifs)}
    </div>
  </Container>
  );

  return (
    <div class={[flex, wevenly, clip, h100, w100, borderbox, padding, gap]}>

      {use(
        this.width,
        w => w > 800 &&
          <div class={[flex, col, gap, h100, rule`width: min-content`]}>
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

            {use(this.width, w => w < 1200 && notifications || "")}
          </div>
          || ""
      )}
      <Container title="feed" class={[flex, col, clip, rule`flex: 1`]}>
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
        <Timeline kind="home" />
      </Container>
      {use(this.width, w => w > 1200 &&
        <div class={[rule`width: min-content`]}>
          {notifications}
        </div>
        || "")}
    </div>
  )

}



App.prototype.fetchnotifs = async function() {
  let req = await fetch("/api/v1/notifications?limit=20" + (this.notifs_since_id && `&since_id=${this.notifs_since_id}` || ""));
  let notifs = await req.json();

  if (notifs.length > 0)
    this.notifs_since_id = notifs[0].id;
  for (const notification of notifs) {
    const { account, id, created_at, status, type } = notification;
    if (status)
      await parseStatus(status);


    let view = <NotificationView notification={notification} />;

    this.notifs = [...this.notifs, view];
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

let notcss = css`
.img {
  border-radius: 5px;
}
`;
export const NotificationView: Component<{
  notification: Notification
}, {}> = function() {
  this.css = notcss;
  let status = statuses.get(this.notification.status?.id)!;

  return (
    <div class={[flex, gap, borderbox, w100]}>
      <div>
        <img class="img" src={this.notification.account.avatar} width="32" height="32" />
      </div>
      <div class={[flex, col, rule`flex: 1`]}>
        <div>
          {this.notification.account.acct}
          {" "}
          {this.notification.type === "favourite" && "favourited" || ""}
        </div>
        <div>

          {this.notification.type === "mention" &&
            <Post post={statuses.get(this.notification.status.id)!} hideauthor />
            || this.notification.type === "favourite" &&
            <div>
              <ContentRenderer post={status} />
            </div>
            || ""}
        </div>
      </div>
    </div>)
}

export const Container: Component<{ class: any, title?: string }, {}> = function() {
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
    <div class={[...this.class]}>
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

// function Home() {
//   console.log("Ghu")
//   this.b = "asd";
//   return <div>
//     <input bind:value={use(this.b)} />
//     {use(this.b)} is {use(this.b, b => (b % 2 == 0) && "even" || "odd")}
//   </div>
// }

// export const app: App = (<App />).$;

export const router = (
  <Router>
    <Route path="/" show={() => <App />} />

  </Router>
).$

document.querySelector('#app')!.appendChild(router.root);
router.route(location.pathname);
