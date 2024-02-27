import { Compose } from "./Compose";
import { send, sendForm as sendForm } from "./api";
import { flex, col, wevenly, hcenter, w100, gap, borderbox } from "./css";
import { accounts, KnownStatus, parseStatus, Status, statuses } from "./state";
import { AccountView } from "./AccountView";
import { ContentRenderer } from "./ContentRenderer";
import { Link } from "@mercuryworkshop/dreamland-router";

export function getRelativeTimeString(
  date: Date | number,
): string {
  const timeMs = typeof date === "number" ? date : date.getTime();
  const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);
  const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];
  const units: Intl.RelativeTimeFormatUnit[] = ["second", "minute", "hour", "day", "week", "month", "year"];
  const unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(deltaSeconds));
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;
  const rtf = new Intl.RelativeTimeFormat(navigator.language, { numeric: "auto", style: "narrow" });
  return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
}

export const Post: Component<{
  post: KnownStatus
  reblog?: KnownStatus

  showcompose?: boolean
  hideauthor?: boolean
  hidereplyto?: boolean
}, {
  timestamp: Date
}> = function() {
  this.css = css`
self {
  /* min-width: 400px; */
}

.actions {
  button {
    border: none;
    background-color: initial;
    display: flex;
    gap: 8px;
    align-items: center;
    font-family: monospace;
    cursor: pointer;
  }
  button:hover {
    transform: scale(110%);
  }

  button.activated iconify-icon {
    color: var(--accent);
  }

  button.spin iconify-icon {
    animation: spin 1s infinite linear;
  }
}

.reblogged iconify-icon {
  transform: scale(130%);
}

.authorshelf {
  a {
    text-decoration: none;
    color: var(--text);
  }

  img {
    border-radius: 5px;
  }
}

`;;
  this.showcompose = false;


  let post = this.post;
  let reblog = this.reblog?.object;



  this.mount = () => {
  }

  return (
    <div class={[flex, col, w100, borderbox, rule`gap: 0.5em`]}>
      {reblog ? (
        <div class={[flex, gap, "reblogged"]}>
          <iconify-icon icon="fa:rocket" />
          <AccountView account={reblog.account} />
          <span>
            reblogged
          </span>
          <span>
            {getRelativeTimeString(new Date(post.object.created_at))}
          </span>
        </div>
      ) : ""}
      {
        !this.hideauthor &&
        <div class={[flex, wevenly, hcenter, "authorshelf"]}>
          <Link href={`/feed/user/` + post.object.account.id} class={[flex, hcenter, gap]}>
            <img src={post.object.account.avatar} width="32" height="32" />
            <div class={[flex, col]}>
              <h3>
                {post.object.account.display_name}
              </h3>
              {post.object.account.acct}
            </div>
          </Link>
          <div>
            {use(post.object.id)}
          </div>
          <Link href={"/feed/notice/" + post.id}>
            {getRelativeTimeString(new Date(post.object.created_at))}
          </Link>
        </div>
        || ""
      }
      {
        !this.hidereplyto && post.object.in_reply_to_account_id &&
        <div class={[flex, hcenter, rule`gap: 0.3em`]}>
          <iconify-icon icon="prime:reply" />
          reply to
          <AccountView account={accounts.get(post.object.in_reply_to_account_id)?.account!} showpfp />
        </div>
        || ""
      }
      <ContentRenderer post={post} />
      <div class={["actions", flex, rule`gap:0.25em`]}>
        <button on:click={() => this.showcompose = true}>
          <iconify-icon icon="fa:reply" />
          {use(post.object.replies_count)}
        </button>

        <button
          class={[
            use(post.object.favourited, f => f && "activated"),
            use(post.favouriting, f => f && "spin")
          ]}
          on:click={async () => {
            let res;
            post.favouriting = true;
            if (!post.object.favourited)
              res = await send(`/api/v1/statuses/${post.id}/favourite`, {});
            else
              res = await send(`/api/v1/statuses/${post.id}/unfavourite`, {});
            await parseStatus(res);
            post.favouriting = false;
          }}>
          <iconify-icon icon="fa:star" />
          {use(post.object.favourites_count)}
        </button>

        <button
          class={[
            use(post.object.reblogged, f => f && "activated"),
            use(post.reblogging, f => f && "spin")
          ]}

          on:click={async () => {
            let res;

            post.reblogging = true;
            if (!post.object.reblogged)
              res = await send(`/api/v1/statuses/${post.id}/reblog`, {});
            else
              res = await send(`/api/v1/statuses/${post.id}/unreblog`, {});
            post.reblogging = false;

            await parseStatus(res);
          }}>
          <iconify-icon icon="fa:retweet" />
          {use(post.object.reblogs_count)}
        </button>

        <button on:click={async () => {
        }}>
          <iconify-icon icon="fa6-solid:face-smile" />
        </button>

        <button on:click={async () => {
        }}>
          <iconify-icon icon="fa6-solid:ellipsis-vertical"></iconify-icon>
        </button>
      </div>

      {$if(use(this.showcompose),
        <Compose
          onsend={() => this.showcompose = false}
          content={["@" + post.object.account.acct, ...post.object.mentions.map(acc => "@" + acc.acct)].join(" ")}
          replyto={post}
        />
      )}
    </div>
  )
}
