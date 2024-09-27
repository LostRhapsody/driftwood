import { Button } from "@/components/ui/button"

type Post = {
	title: string;
	tags: string[];
	date: string;
	image: string;
	filename: string;
	excerpt: string;
};

type PostsListProps = {
	posts: Post[];
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	onEditClick: any;
};

const Card: React.FC<PostsListProps> = ({ posts, onEditClick }) => {
	console.log("onEditClick: ", onEditClick);
	return (
		<div className="w-full flex flex-wrap gap-8 justify-start">
			{posts.map((post) => {
				return (
					<div
						key={post.title}
						className="card"
						data-date={post.date}
						data-tags={post.tags}
						data-title={post.title}
					>
						<img src={post.image} alt={post.title} className="card__image" />
						<div className="card__overlay">
							<div className="card__content">
								<h2 className="card__title">
									<a href={post.filename}>{post.title}</a>
								</h2>
								{post.excerpt && (
									<p className="card__excerpt">{post.excerpt}</p>
								)}
								<p className="card__date">{post.date}</p>
                <p>
								{post.tags.map((tag, index) => {
									const isLast = index === post.tags.length - 1;
									return (
										<span key={tag} className="card__tags">
											{isLast ? (
                        <span>
                          {tag}
                        </span>
											) : (
												<span>{tag},&nbsp;</span>
											)}
										</span>
									);
								})}
                </p>
                <Button onClick={() => onEditClick(post.title)}>Edit post</Button>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default Card;
