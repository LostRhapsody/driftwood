export type Post = {
	post_id: number;
	site_id: string;
	title: string;
	tags: string[];
	date: string;
	image: string;
	filename: string;
	excerpt: string;
	content: string;
	published: boolean;
};