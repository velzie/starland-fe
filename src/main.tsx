import './style.css'
import "@mercuryworkshop/dreamlandjs";
import '@fontsource/poppins';
import '@fontsource-variable/rubik';
import 'iconify-icon';

import { Link, Redirect, Route, Router } from "@mercuryworkshop/dreamland-router";

import { flex, wevenly, hcenter, col, scrolly, h100, clip, w100, borderbox, padding, gap } from "./css";
// import { Post } from "./Post";
import { LoginCreds, auth, sendForm } from './api';
import { Account, parseStatus, state, Status, statuses, store } from './state';
import { Compose } from './Compose';
import { Timeline } from './Timeline';
import { Post } from './Post';
import { Container } from './Container';
import { Notifications } from './Notifications';
import { User } from './User';
import { AccountView } from './AccountView';


const Home: Component<{}, {
  width: number
  outlet: ComponentElement<typeof Timeline>
}> = function() {
  this.css = css`
self {
  /* height: 100%; */
}
`;

  this.width = window.innerWidth
  this.mount = async () => {
    if (store.activeacc != null)
      state.user = await auth(store.accounts[store.activeacc]);
    else
      await auth(null);


    window.addEventListener("resize", () => {
      this.width = window.innerWidth
    });
  };


  const notifications = <Notifications />;
  return (
    <div class={[flex, wevenly, clip, h100, w100, borderbox, padding, gap]}>
      {$if(use(this.width, w => w > 800),
        <div class={[flex, col, gap, h100, rule`width: min-content`]}>
          {$if(use(state.user),
            <Container class={[flex, col, padding, gap]} title="post">
              <AccountInfo />
              <Compose />
            </Container>,
            <Login />
          )}
          {$if(use(this.width, w => w < 1200), notifications)}
        </div>
      )}
      <Container title="feed" class={[flex, col, rule`flex: 1`]}>
        <Navigation />
        {use(this.outlet)}
      </Container>
      {use(this.width, w => w > 1200 &&
        <div class={[rule`width: min-content`]}>
          {notifications}
        </div>
        || ""
      )}
    </div>
  )
}
export const AccountInfo: Component<{

}, {
  dialog: HTMLDialogElement
}> = function() {
  this.css = css`
dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  border: 3px solid var(--accent);
}


.active {
  border: 2px solid var(--accent);
}

`

  return (
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
      <div class={[flex, col, rule`flex: 1; align-items: end`]}>
        <iconify-icon on:click={() => {
          this.dialog.showModal();
        }} icon="fa:list" />
      </div>
      <dialog on:click={() => this.dialog.close()}
        bind:this={use(this.dialog)}>
        <div on:click={e => e.stopImmediatePropagation()} class={[padding, flex, col, gap]}>
          <h1>Accounts</h1>
          {use(store.accounts, accounts => accounts.map((account, i) =>
            <div on:click={async () => {
              store.activeacc = i;
              let user = await auth(account);
              this.dialog.close();
              state.user = user;
            }} class={[flex, padding, rule`background-color: var(--surface)`, use(store.activeacc, active => active == i && "active")]}>
              <AccountView account={account.account!} showpfp />
              <iconify-icon on:click={() => { }} icon="fa:close" />
            </div>
          ))}

          <h1>Add Account</h1>
          <Login />
        </div>
      </dialog>
    </Container>
  )
}
export const Login: Component<{
}, {
  username: string
  password: string

  errortext: string
}> = function() {
  this.username = "";
  this.password = "";
  this.errortext = "";

  return (
    <Container title="login" class={[padding, flex, col, gap]}>
      <input bind:value={use(this.username)} placeholder="username" />
      <input bind:value={use(this.password)} type="password" placeholder="password" />
      <div class={[flex]}>
        <button on:click={async () => {
          let creds: LoginCreds = { username: this.username, password: this.password };

          try {
            let user = await auth(creds);
            state.user = user;
            creds.account = user;
            store.accounts = [creds, ...store.accounts];
            store.activeacc = 0;
          } catch (e: any) {
            this.password = "";

            this.errortext = e;
          }
        }}>log in</button>
      </div>
      <span>{use(this.errortext)}</span>
    </Container>
  );
}

export const Navigation: Component<{}, {}> = function() {
  this.css = css`
self {
  border-bottom: 1px solid var(--accent);
  
  padding: 10px;
}
iconify-icon {
  transform: scale(120%);
}
iconify-icon.activated {
  color: var(--accent);
}
button {
  outline: none;
  background: none;
  border: none;
  cursor: pointer;
}
a {
  color: white;
}
`;

  return (
    <div class={[flex, wevenly]}>
      <div class={[flex, gap]}>
        {$if(use(state.user),
          <Link href="/feed/home">
            <iconify-icon icon="fa:home" />
          </Link>
        )}
        <Link href="/feed/public">
          <iconify-icon icon="fa:users" />
        </Link>
        {$if(use(state.user),
          <Link href="/feed/bubble">
            <iconify-icon icon="fluent:bubble-multiple-20-filled" />
          </Link>
        )}
        {$if(use(state.user),
          <Link href="/feed/bookmark">
            <iconify-icon icon="fa:bookmark" />
          </Link>
        )}
      </div>
      <div class={[flex, gap]}>
        <button>
          <iconify-icon icon="fa:search" />
        </button>
        <Link href="/settings">
          <iconify-icon icon="fa:gear" />
        </Link>
      </div>
    </div>
  )
}


function Settings() {
  return (
    <div class={[flex, wevenly, clip, h100, w100, borderbox, padding, gap]}>
      <Container class={[flex, col, borderbox]} title="Category">
        <button>
          a
        </button>
      </Container>
      <Container class={[rule`flex: 1`]} title="Settings">

      </Container>
    </div>
  )
}

function PageNotFound() {
  return <div>404</div>
}

const Notice: Component<{

}, {
  id: string
}> = function() {

  handle(use(this.id), id => {

  })

  return (
    <div>

    </div>
  )
}

export const router = (
  <Route path="/">
    <Route path="feed" show={<Home />}>
      <Route path="home" show={<Timeline kind="timelines/home" />} />
      <Route path="public" show={<Timeline kind="timelines/public?local=true" />} />
      <Route path="bubble" show={<Timeline kind="timelines/bubble" />} />
      <Route path="bookmarks" show={<Timeline kind="timelines/bookmarks" />} />

      <Route path="notice">
        <Route path=":id" show={<Notice />} />
      </Route>

      <Route path="user" show={<User />}>
      </Route>

      <Redirect path="" to="/feed/home" />
    </Route>

    <Route path="settings" show={<Settings />} />

    <Redirect path="" to="/feed" />
    <Route regex path=".*" show={<PageNotFound />} />
  </Route>
).$

router.render(document.querySelector('#app')!);
(window as any).router = router;
