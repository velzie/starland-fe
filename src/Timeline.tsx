import { Post } from "./Post";
import { flex, wevenly, hcenter, col, h100, scrolly, gap, clip, padding, borderbox, w100 } from "./css";
import { KnownStatus, parseStatus, state, Status } from "./state";
import { PostTree } from "./PostTree";

export const Timeline: Component<{
  kind: string
}, {
  since_id: string
  posts: ComponentElement<typeof Post>[]
  max_id: string
  postsroot: HTMLElement
  fetchinitial: () => Promise<void>
  fetchup: () => void
  fetchdown: () => void
  addpost: (status: KnownStatus) => Promise<ComponentElement<typeof Post>>
}> = function() {
  this.posts = [];
  this.since_id = ""

  this.fetchinitial = async () => {

    let req = await fetch(`/api/v1/${this.kind}?limit=20`);
    let statuses: Status[] = await req.json();

    if (statuses.length > 0) {
      this.since_id = statuses[0].id;
      this.max_id = statuses[statuses.length - 1].id;

      for (const status of statuses) {
        let known = await parseStatus(status);
        this.posts = [...this.posts, await this.addpost(known)];
      }
    }
  }

  this.mount = async () => {

    handle(use(state.user), async () => {
      // clear everything when user changes
      this.posts = [];
      await this.fetchinitial();
    });


    setInterval(() => {
      // this.fetchup();
      if (this.postsroot.scrollTop > this.postsroot.scrollHeight - 2000) {
        // console.log("FUCK!!");
        // this.fetchdown();
      }
    }, 1000);
  };

  return (
    <div class={[flex, col, hcenter, h100, padding, borderbox]}>
      <div bind:this={use(this.postsroot)} class={[w100, flex, col, hcenter, gap, rule`scrollbar-width: none`]}>
        {use(this.posts)}
      </div>
    </div>
  )
}
Timeline.prototype.addpost = async function(this: ThisParameterType<typeof Timeline>, status: KnownStatus) {
  // console.log(status);
  let post = <PostTree post={status} />;
  return post;

  // this.posts = this.posts.sort(({ $: { timestamp: a } }: { $: Post }, { $: { timestamp: b } }: { $: Post }) => a < b && 1 || -1);

}
Timeline.prototype.fetchup = async function(this: ThisParameterType<typeof Timeline>) {
  let req = await fetch(`/api/v1/timelines/${this.kind}?limit=20&since_id=${this.since_id}`);
  let statuses: Status[] = await req.json();


  if (statuses.length > 0)
    this.since_id = statuses[0].id;

  for (const status of statuses) {

    let known = await parseStatus(status);

    this.posts = [await this.addpost(known), ...this.posts];
  }
};

Timeline.prototype.fetchdown = async function(this: ThisParameterType<typeof Timeline>) {
  let req = await fetch(`/api/v1/timelines/${this.kind}?limit=20&max_id=${this.max_id}`);
  let statuses: Status[] = await req.json();

  if (statuses.length == 0) return;
  this.max_id = statuses[statuses.length - 1].id;
  for (const status of statuses) {
    let known = await parseStatus(status);

    this.posts = [...this.posts, await this.addpost(known)];
  }
};
