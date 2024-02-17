import { Post } from "./Post";
import { flex, wevenly, hcenter, col, h100, scrolly, gap, clip, padding, borderbox, w100 } from "./css";
import { parseStatus, Status } from "./state";
import { PostTree } from "./PostTree";

export type Timeline = DLComponent<{
  posts: DLElement<Post>[]
  since_id: string
  max_id: string
  kind: string
  postsroot: HTMLElement
  fetchup: () => void
  fetchdown: () => void
  addpost: (status: Status) => Promise<DLElement<Post>>
}>
export function Timeline(this: Timeline) {
  this.posts = [];
  this.since_id = ""

  this.mount = async () => {

    let req = await fetch(`/api/v1/timelines/${this.kind}?limit=20`);
    let statuses: Status[] = await req.json();

    this.since_id = statuses[0].id;
    this.max_id = statuses[statuses.length - 1].id;

    for (const status of statuses) {
      await parseStatus(status);
      this.posts = [...this.posts, await this.addpost(status)];
    }
    console.log(this.max_id, this.since_id);


    setInterval(() => {
      this.fetchup();
      if (this.postsroot.scrollTop > this.postsroot.scrollHeight - 2000) {
        console.log("FUCK!!");
        this.fetchdown();
      }
    }, 1000);
  };

  return (
    <div class={[flex, col, hcenter, h100, clip, padding, borderbox]}>
      <div bind:this={use(this.postsroot)} class={[w100, flex, col, hcenter, gap, scrolly, rule`scrollbar-width: none`]}>
        {use(this.posts)}
      </div>
    </div>
  )
}
Timeline.prototype.addpost = async function(this: Timeline, status: Status) {

  if (status.reblog) {
    await parseStatus(status.reblog);

    let timestamp = new Date(status.reblog.created_at);

    let post = <Post id={status.reblog.id} timestamp={timestamp} reblog={status.id} />;

    return post;
  } else {
    let timestamp = new Date(status.created_at);

    let post = <PostTree id={status.id} timestamp={timestamp} />;
    return post;
  }

  // this.posts = this.posts.sort(({ $: { timestamp: a } }: { $: Post }, { $: { timestamp: b } }: { $: Post }) => a < b && 1 || -1);

}
Timeline.prototype.fetchup = async function(this: Timeline) {
  let req = await fetch(`/api/v1/timelines/${this.kind}?limit=20&since_id=${this.since_id}`);
  let statuses: Status[] = await req.json();


  if (statuses.length > 0)
    this.since_id = statuses[0].id;

  for (const status of statuses) {

    await parseStatus(status);

    this.posts = [await this.addpost(status), ...this.posts];
  }
};

Timeline.prototype.fetchdown = async function(this: Timeline) {
  let req = await fetch(`/api/v1/timelines/${this.kind}?limit=20&max_id=${this.max_id}`);
  let statuses: Status[] = await req.json();
  this.max_id = statuses[statuses.length - 1].id;
  console.log(statuses);
  for (const status of statuses) {
    await parseStatus(status);

    this.posts = [...this.posts, await this.addpost(status)];
  }
};
