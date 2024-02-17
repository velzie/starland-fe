import { Compose } from "./Compose";
import { send, sendForm as sendForm } from "./api";
import { flex, col, wevenly, hcenter, w100, gap, borderbox } from "./css";
import { accounts, KnownStatus, parseStatus, statuses } from "./state";
import { AccountView } from "./AccountView";

let postcss = css`
self {
  /* min-width: 400px; */
}

button {
  border: none;
  background-color: initial;
  display: flex;
  gap: 8px;
  align-items: center;
  font-family: monospace;
}

img {
  border-radius: 5px;
}

`;

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

export type Post = DLComponent<{
  id: string
  reblog: string | null
  timestamp: Date
  showcompose: boolean
  hideauthor: boolean
}>
export function Post(this: Post) {
  this.css = postcss;
  this.showcompose = false;


  let post = statuses.get(this.id)!;
  let reblog = this.reblog && statuses.get(this.reblog)?.object;




  this.mount = () => {
  }

  return (
    <div class={[flex, col, w100, borderbox, rule`gap: 0.5em`]}>
      {reblog ? (
        <div>
          {reblog.account.display_name} reblogged
        </div>
      ) : ""}
      {
        !this.hideauthor &&
        <div class={[flex, wevenly, hcenter]}>
          <div class={[flex, hcenter, gap]}>
            <img src={post.object.account.avatar} width="48" height="48" />
            <div class={[flex, col]}>
              <h3>
                {post.object.account.display_name}
              </h3>
              {post.object.account.acct}
            </div>
          </div>
          <div>
            {use(post.object.id)}
          </div>
          <div>
            {getRelativeTimeString(new Date(post.object.created_at))}
          </div>
        </div>
        || ""
      }
      {
        post.object.in_reply_to_account_id &&
        <div class={[flex, hcenter, rule`gap: 0.3em`]}>
          <iconify-icon icon="prime:reply" />
          reply to
          <AccountView account={accounts.get(post.object.in_reply_to_account_id)?.account} showpfp />
        </div>
        || ""
      }
      <ContentRenderer post={post} />
      <div class={[flex, rule`gap:0.25em`]}>
        <button on:click={() => this.showcompose = true}>
          <iconify-icon icon="fa:reply" />
          {use(post.object.replies_count)}
        </button>

        <button on:click={async () => {
          let post = await send(`/api/v1/statuses/${this.id}/favourite`, {});
          await parseStatus(post);
        }}>
          <iconify-icon icon="fa:star" />
          {use(post.object.favourites_count)}
        </button>

        <button on:click={async () => {
          let post = await send(`/api/v1/statuses/${this.id}/reblog`, {});
          await parseStatus(post);
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

      <div if={use(this.showcompose)}>
        <Compose
          onsend={() => this.showcompose = false}
          content={["@" + post.object.account.acct, ...post.object.mentions.map(acc => "@" + acc.acct)].join(" ")}
        />
      </div>
    </div>
  )
}

export type ContentRenderer = DLComponent<{
  post: KnownStatus
  postroot: HTMLElement
}>;
export function ContentRenderer(this: ContentRenderer) {

  this.mount = () => {

    // TODO sanitize
    handle(use(this.post.object.content), content => this.postroot.innerHTML = content);
  }

  return (
    <div>
      <div bind:this={use(this.postroot)} />
      <div class={[flex, col]}>
        {this.post.object.media_attachments.map(a => <img src={a.remote_url} alt={a.description} />)}
      </div>
    </div>
  )
}
