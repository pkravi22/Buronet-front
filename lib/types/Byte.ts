export type SuggestionType = 'For You' | 'Connections' | 'Popular';

export interface Creator {
    id: string;
    name: string;
    handle: string;
    pic: string;
}

export interface Submission {
    title: string;
    description: string;
    mediaUrl: string;
    thumbnail: string;
}

export interface Byte {
    id: string;
    creator: Creator;
    submission: Submission;
    tags: string[];
    likes: string[]; // Array of user IDs
    saves: string[]; // Array of user IDs
    commentCount: number;
}

export interface Comment {
    id: string;
    creator: Creator;
    text: string;
    createdAt: string;
}
