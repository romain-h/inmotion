export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Video = {
  __typename?: 'Video';
  id: Scalars['ID'];
  title: Scalars['String'];
  src: Scalars['String'];
  transcript?: Maybe<Transcript>;
  editions?: Maybe<Array<Maybe<Edition>>>;
  isTranscriptReady: Scalars['Boolean'];
};

export type MonologueElement = {
  __typename?: 'MonologueElement';
  type: Scalars['String'];
  value: Scalars['String'];
  ts?: Maybe<Scalars['Float']>;
  tsEnd?: Maybe<Scalars['Float']>;
};

export type Monologue = {
  __typename?: 'Monologue';
  speaker?: Maybe<Scalars['Int']>;
  elements?: Maybe<Array<Maybe<MonologueElement>>>;
};

export type Transcript = {
  __typename?: 'Transcript';
  monologues?: Maybe<Array<Maybe<Monologue>>>;
};

export type Edition = {
  __typename?: 'Edition';
  id: Scalars['ID'];
  video: Video;
  title: Scalars['String'];
  clips: Array<Maybe<Clip>>;
  previewURL?: Maybe<Scalars['String']>;
  exportURL?: Maybe<Scalars['String']>;
};

export type Clip = {
  __typename?: 'Clip';
  id: Scalars['ID'];
  order: Scalars['Int'];
  ts?: Maybe<Scalars['Float']>;
  tsEnd?: Maybe<Scalars['Float']>;
  edition?: Maybe<Edition>;
  src?: Maybe<Scalars['String']>;
  thumbnail?: Maybe<Scalars['String']>;
};

export type Preview = {
  __typename?: 'Preview';
  loading: Scalars['Boolean'];
  url?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  videos: Array<Video>;
  video: Video;
  edition: Edition;
};

export type QueryVideoArgs = {
  id: Scalars['String'];
};

export type QueryEditionArgs = {
  id: Scalars['String'];
};

export type EditionInput = {
  vid: Scalars['ID'];
};

export type ClipInput = {
  eid: Scalars['ID'];
  ts?: Maybe<Scalars['Float']>;
  tsEnd?: Maybe<Scalars['Float']>;
};

export type GeneratedUploader = {
  __typename?: 'GeneratedUploader';
  id: Scalars['String'];
  url: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  updateVideoTitle: Video;
  createClip: Clip;
  createEdition: Edition;
  reorderClip: Array<Clip>;
  removeClip: Scalars['Boolean'];
  generateVideoUploadURL: GeneratedUploader;
};

export type MutationUpdateVideoTitleArgs = {
  id: Scalars['ID'];
  title: Scalars['String'];
};

export type MutationCreateClipArgs = {
  input?: Maybe<ClipInput>;
};

export type MutationCreateEditionArgs = {
  input?: Maybe<EditionInput>;
};

export type MutationReorderClipArgs = {
  eid: Scalars['ID'];
  id: Scalars['ID'];
  newIndex: Scalars['Int'];
};

export type MutationRemoveClipArgs = {
  eid: Scalars['ID'];
  id?: Maybe<Scalars['String']>;
};

export type MutationGenerateVideoUploadUrlArgs = {
  name: Scalars['String'];
  type: Scalars['String'];
  size: Scalars['Int'];
};

export type Subscription = {
  __typename?: 'Subscription';
  previewUpdate: Preview;
};

export type SubscriptionPreviewUpdateArgs = {
  eid: Scalars['ID'];
};
