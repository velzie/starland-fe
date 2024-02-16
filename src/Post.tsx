import { Compose } from "./Compose";
import { send, sendForm as sendForm } from "./api";
import { flex, col, wevenly, hcenter, w100 } from "./css";
import { accounts, KnownStatus, parseStatus, statuses } from "./state";
import { AccountView } from "./AccountView";

let postcss = css`
self {
  max-width: 600px;
}
`;

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
    <div class={[flex, col, w100]}>
      {reblog ? (
        <div>
          {reblog.account.display_name} reblogged
        </div>
      ) : ""}
      {
        !this.hideauthor &&
        <div class={[flex, wevenly]}>
          <div class={[flex, hcenter]}>
            <img src={post.object.account.avatar} width="32" height="32" />
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
            {this.timestamp.getMinutes()}
          </div>
        </div>
        || ""
      }
      {
        post.object.in_reply_to_account_id &&
        <div class={[flex,hcenter]}>
          in reply to
          <AccountView account={accounts.get(post.object.in_reply_to_account_id)?.account} showpfp/>
        </div>
        || ""
      }
      <ContentRenderer post={post} />
      <div class={[flex, wevenly]}>
        <div>
          {use(post.object.replies_count)} replies
          <button on:click={() => this.showcompose = true}>reply</button>
        </div>
        <div>
          {use(post.object.favourites_count)} stars
          <button on:click={async () => {
            let post = await send(`/api/v1/statuses/${this.id}/favourite`, {});
            parseStatus(post);
          }}>star</button>
        </div>
        <div>
          {use(post.object.reblogs_count)} reblogs
          <button on:click={async () => {
            let post = await send(`/api/v1/statuses/${this.id}/reblog`, {});
            parseStatus(post);
          }}>reblog</button>
        </div>

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
