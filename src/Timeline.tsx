import { Post } from "./Post";
import { flex, wevenly, hcenter, col, h100, scrolly } from "./css";
import { Status, app } from "./main";

export type Timeline = DLComponent<{
  posts: DLElement<Post>[]
  since_id: string | null
  kind: string
  fetch: () => void
}>
export function Timeline(this: Timeline) {
  this.posts = [];
  this.since_id = ""

  this.mount = () => {
    this.fetch();
  };

  return (
    <div class={[flex, col, hcenter, h100]}>
      <button on:click={() => this.fetch()}> more posts :3</button>
      <div class={[flex, col, hcenter, scrolly]}>
        {use(this.posts)}
      </div>
    </div>
  )
}

Timeline.prototype.fetch = async function() {
  let req = await fetch(`/api/v1/timelines/${this.kind}?limit=20` + (this.since_id && `&since_id=${this.since_id}` || ""));
  let objects: Status[] = await req.json();

  console.log(objects);

  for (const object of objects.reverse()) {
    app.recieveobj(object);

    this.since_id = object.id;

    if (object.reblog) {
      app.recieveobj(object.reblog);

      let timestamp = new Date(object.reblog.created_at);

      let post = <Post id={object.reblog.id} timestamp={timestamp} reblog={object.id} />;

      this.posts = [post, ...this.posts];
    } else {
      let timestamp = new Date(object.created_at);

      let post = <Post id={object.id} timestamp={timestamp} />;
      this.posts = [post, ...this.posts];
    }

    // this.posts = this.posts.sort(({ $: { timestamp: a } }: { $: Post }, { $: { timestamp: b } }: { $: Post }) => a < b && 1 || -1);

  }

};
