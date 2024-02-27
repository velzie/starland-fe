import { AccountView } from "./AccountView";
import { col, flex } from "./css";
import { KnownStatus, accounts } from "./state";

export const ContentRenderer: Component<{
  post: KnownStatus
}, {
  postroot: HTMLElement
}> = function() {
  this.css = css`
self {
  font-family: 'Rubik', sans-serif;
  font-size: 11pt;
}

.embed {
  max-width: 300px;

}
`;
  this.mount = () => {
    handle(use(this.post.object.content), content => {
      for (let emoji of this.post.object.emojis) {
        content = content.replaceAll(`:${emoji.shortcode}:`, `<img src="${emoji.url}" alt="${emoji.shortcode}" width="16" height="16" />`);
      }
      this.postroot.innerHTML = content;

      for (const link of this.postroot.querySelectorAll(".h-card .u-url.mention")) {
        let id = link.getAttribute("data-user");
        if (id) {
          let acc = accounts.get(id);

          link.parentElement!.replaceWith(<AccountView showpfp account={acc?.account!} />)
        }
      }


    });
  }

  return (
    <div>
      <div bind:this={use(this.postroot)} />
      <div class={[flex, col]}>
        {this.post.object.media_attachments.map(a => <img class="embed" src={a.remote_url} alt={a.description} />)}
      </div>
    </div>
  )
}
