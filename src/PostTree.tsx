import { borderbox, col, flex, gap, w100 } from "./css";
import { Post } from "./Post"
import { KnownStatus, statuses } from "./state";


let tcss = css`
self {
    /* border-top: 1px solid var(--accent); */
    /* padding-top: 1em; */
    /* padding-bottom: 1em; */
    padding: 1em;

    border-radius: 10px;
    background: #1a1a1a;
}
.indent {
    padding-left: 2em;
}
`;
export const PostTree: Component<{
    post: KnownStatus
}, {}> = function() {
    this.css = tcss;



    let post = this.post;
    let reblog: KnownStatus = null!;
    if (post.object.reblog) {
        // console.log(this.post.object.reblog);
        reblog = post;
        post = statuses.get(post.object.reblog.id)!;
    }

    let reply_to_id = post.object.in_reply_to_id

    let reply_to_post = statuses.get(reply_to_id!)!;

    return (
        <div class={[w100, borderbox, flex, col, gap]}>
            {reply_to_id &&
                <Post post={reply_to_post} />
                || ""
            }
            <div class={[reply_to_id && "indent"]}>
                <Post post={post} reblog={reblog} hidereplyto />
            </div>
        </div>
    )
}
