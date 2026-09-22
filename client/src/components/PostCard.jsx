function PostCard({ post }) {
  return (
    <article className="border-b border-stone-200 py-7 first:pt-0">
      <h2 className="font-serif text-2xl font-semibold">{post.title}</h2>
      <p className="mt-3 whitespace-pre-wrap leading-7 text-stone-700">{post.body}</p>
    </article>
  );
}

export default PostCard;
