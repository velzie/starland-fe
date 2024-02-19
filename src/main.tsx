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
import { Post } from './Post';
import { Container } from './Container';
import { Notifications } from './Notifications';



const App: Component<{}, {
  width: number
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
