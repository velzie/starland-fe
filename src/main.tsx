import './style.css'
import "@mercuryworkshop/alicejs";
import '@fontsource/poppins';
import '@fontsource-variable/rubik';
import 'iconify-icon';

import { Link, Redirect, Route, Router } from "@mercuryworkshop/dreamland-router";

import { flex, wevenly, hcenter, col, scrolly, h100, clip, w100, borderbox, padding, gap } from "./css";
// import { Post } from "./Post";
import { auth, sendForm } from './api';
import { Account, parseStatus, state, Status, statuses } from './state';
import { Compose } from './Compose';
import { Timeline } from './Timeline';
import { Post } from './Post';
import { Container } from './Container';
import { Notifications } from './Notifications';


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
    await auth();


    window.addEventListener("resize", () => {
      this.width = window.innerWidth
    });
  };


  const notifications = <Notifications />;

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
        <Navigation />
        {use(this.outlet)}
      </Container>
      {use(this.width, w => w > 1200 &&
        <div class={[rule`width: min-content`]}>
          {notifications}
        </div>
        || "")}
    </div>
  )

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
        <Link href="/feed/home">
          <iconify-icon icon="fa:home" />
        </Link>
        <Link href="/feed/public">
          <iconify-icon icon="fa:users" />
        </Link>
        <Link href="/feed/bubble">
          <iconify-icon icon="fluent:bubble-multiple-20-filled" />
        </Link>
        <Link href="/feed/bookmark">
          <iconify-icon icon="fa:bookmark" />
        </Link>
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

function User() {
  return <div>
    user w
    {use(this.id)}
  </div>
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
      <Route path="home" show={<Timeline kind="home" />} />
      <Route path="public" show={<Timeline kind="public?local=true" />} />
      <Route path="bubble" show={<Timeline kind="bubble" />} />
      <Route path="bookmarks" show={<Timeline kind="bookmarks" />} />
      <Redirect path="" to="/feed/home" />
    </Route>
    <Route path="notice">
      <Route path=":id" show={<Notice />} />
    </Route>
    <Route path="user">
      <Route path=":id" show={<User />} />
    </Route>
    <Route path="settings" show={<Settings />} />

    <Redirect path="" to="/feed" />
    <Route regex path=".*" show={<PageNotFound />} />
  </Route>
).$

router.render(document.querySelector('#app')!);
(window as any).router = router;
