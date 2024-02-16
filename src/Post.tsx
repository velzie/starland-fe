import { Compose } from "./Compose";
import { send, sendForm as sendForm } from "./api";
import { flex, col, wevenly, hcenter } from "./css";
import { KnownStatus, app, statuses } from "./main";

let postcss = css`
self {
  border: 2px solid black;
  max-width: 400px;
  padding: 1em;
  margin: 1em;
}
`;

export type Post = DLComponent<{
  id: string
  reblog: string | null
  timestamp: Date
  frame: HTMLDivElement
  showcompose: boolean
}>
export function Post(this: Post) {
  this.css = postcss;
  this.showcompose = false;


  let post = statuses.get(this.id)!;
  let reblog = this.reblog && statuses.get(this.reblog)?.object;

  this.mount = () => {

  }

  return (
    <div class={[flex, col]}>
      {reblog ? (
        <div>
          {reblog.account.display_name} reblogged
        </div>
      ) : ""}
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
            app.recieveobj(post);
          }}>star</button>
        </div>
        <div>
          {use(post.object.reblogs_count)} reblogs
          <button on:click={async () => {
            let post = await send(`/api/v1/statuses/${this.id}/reblog`, {});
            app.recieveobj(post);
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
}>;
export function ContentRenderer(this: ContentRenderer) {

  this.mount = () => {

    // TODO sanitize
    handle(use(this.post.object.content), content => this.root.innerHTML = content);
  }

  return (
    <div>
    </div>
  )
}
