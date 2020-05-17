<p align="center">
  <img width="200px" src="https://inmotion.hrdy.me/logo.svg">
</p>

# InMotion

> Turn meeting recordings into shareable content.

InMotion is a cloud based tool that enables you to quickly select highlights
from meeting recordings in an elegant manner, turning long meetings into
a shareable video in a few clicks.

## Overview

Thanks to the breakthrough in machine learning algorithms applied to the
speech-to-text field, it is now possible to conceive products relying on near
instant generated transcripts. In parallel, more and more meetings happen
online, over video chat and are recorded to be shared internally. Video
recordings are easy to produce but it takes a significant amount of time to
extract and share knowledge out of them. InMotion aims to tackle this with
a full cloud based solution.

[![Watch the
video](/doc/preview.gif)](https://youtu.be/jVGCLcZiIKo)

[Full demo video](https://youtu.be/jVGCLcZiIKo)

## Stack

InMotion's API is built with Go, Postgres, GraphQL, S3 and
[FFmpeg](https://www.ffmpeg.org/). The client uses TypeScript, React and
[Next.js](https://nextjs.org) framework.

It also relies on an external speech-to-text API provided by
[Rev.ai](https://www.rev.ai) and [Auth0](https://auth0.com/) as authentication
provider.

The UI is built on top of [BaseWeb](https://baseweb.design) React UI library.

## Design

### Storage limitations

Early on, I decided to use Heroku for its simplicity and Docker support.
By design, it's not possible to attach any volume to Heroku since their dynos
(instances) can be restarted at any time. Each dyno has an ephemeral hard
drive. The recommended way to have an active storage is to use AWS S3.

FFmpeg relies a lot on files to perform manipulations. Since I used FFmpeg CLI,
[rather than a binding](#go-ffmpeg-binding), I came up with an elegant solution
to pipe in and out of S3 [as follows](/server/internal/storage/storage.go#L197-L226).
A FFmpeg command can then use a video on S3 as input and output directly on
another.

Unfortunately, some FFmpeg commands still rely exclusively on files and [a full
download](/server/internal/storage/storage.go#L169-L192) in a temporary folder is
required. This limitation does not guarantee reliability in case you exceed the
temporary storage available on a dyno.

Another (untested) alternative would have been to use an S3 like files system like
[s3fs](https://github.com/s3fs-fuse/s3fs-fuse) or
[goofys](https://github.com/kahing/goofys) but Heroku [does not
support](https://devcenter.heroku.com/articles/container-registry-and-runtime#unsupported-dockerfile-commands)
`VOLUME` mounting.

### Schema first (GraphQL)

InMotion has been built in a Schema first fashion. Starting your reasoning with
the actual schema used by the client makes the development cycle much quicker.
It's easier to spot the critical path required for a feature and then add
minimal fields to each type. [GraphQL](https://graphql.org) is the de facto
query language and is well supported and offers several tools and libraries to
achieve Schema first.

While previously working on a GraphQL gateway on another project, I realised how
I could enforce strong typing from the schema to the client. By relying on the
GraphQL schema introspection feature, I can generate a lot of code out of it,
especially TypeScript types, that can be used client-side. It helps to define
a strict contract between client and server. [GraphQL Code
Generator](https://graphql-code-generator.com) does code generation really well.
For InMotion I went further and also used generated code on the API side.
[Gqlgen](https://gqlgen.com/) is a simple way to implement a GraphQL server in
Go. It also stands out for its Schema First feature that I leveraged here,
reducing the boilerplate required by GraphQL.

### Authentication is hard

InMotion is designed to have a fully stateless API. Designing such APIs is not
hard but when it comes to implementing a client as a Single Page Application
(SPA) securely it's another story...  SPAs as we are designing them today bring
some security concerns and [implementing a secure
flow](https://medium.com/better-programming/how-to-securely-implement-authentication-in-single-page-applications-670534da746f)
takes time. Especially if you implement it with the 2 cookies solution described
[here](https://medium.com/lightrail/getting-token-authentication-right-in-a-stateless-single-page-application-57d0c6474e3).
The Authorization Code Flow (PKCE) is the proven flow to authenticate a SPA.

I chose to use an authentication provider - [Auth0](https://auth0.com/) - for
InMotion, to get the Authorization Code Flow out of the box and secure our API.

### Go-FFmpeg binding

A couple of Go-FFmpeg bindings have been implemented but none seems to be
[features complete](https://github.com/livepeer/lpms/issues/24). I therefore
relied on the FFmpeg CLI and exercised it with Go
[exec](https://golang.org/pkg/os/exec/) package. Using the CLI made it easier to
test and deploy for now but it made the application less portable.

## Thoughts / Observations

### Performance

Editing video in the browser without latency is hard. Each manipulation on
a video that requires to re-encode the video is slow and depends on the length
of the video. For tasks without re-encoding like trimming, you can get near
instant results. But, because I wanted to generate transitions between clips,
which require re-encoding, I had to make tradeoffs between performance and UX.
That's why I chose to trigger the generation of all possible clips up-front in
the background (with goroutines). While users check the first result, all other
combinations are generated asynchronously and make subsequent manipulations like
re-ordering near instant.

Also, to achieve an end-to-end flow from the upload of the raw video to the
download of the final cut, I chose to manipulate the video in its initial
resolution, meaning that our tool is slow on full HD or 4K resolutions. This
allows us to get a download URL ready as soon as the preview is rendered. To
cope with slowness with higher resolutions and as an alternative, I could reduce
the resolution to generate quicker previews and redo the full encoding of the
montage on export.

### FFmpeg filters DSL

One of the core features of InMotion is to perform an end-to-end montage of
clips with slick transitions. I rely on the FFmpeg extended filtering feature to
do this. FFmpeg implements this feature with a filtergraph which is intimidating
  at first. It's a directed graph represented with its own Domain Specific
  Language (DSL) [as
  a text](http://ffmpeg.org/ffmpeg-filters.html#Filtergraph-syntax-1). Using
  a pure text DSL like this makes it easy to use anywhere [with strings
  interpolation](/server/internal/dvr/clips.go#L90-L98). This DSL makes a good example
  to evaluate when applying streams manipulations in other contexts.

### Minio vs. LocalStack S3

Although using S3 is powerful, it's hard to use in a local environment. One easy
solution is to use another S3 bucket, but performance can be worse depending on
your bandwidth and it costs more money. Another solution is to use a replication
of that service locally.  [LocalStack](https://github.com/localstack/localstack)
attempts to do that for the full AWS stack. I started with LocalStack but faced
some limitations with the
[presigned](https://docs.aws.amazon.com/AmazonS3/latest/dev/PresignedUrlUploadObject.html)
PUT URLs. It's also not friendly to use locally as each file is stored as a JSON
representation in a file rather than using the local file system.

Another interesting project is [Minio](https://min.io/), a native object storage
with a fully S3 compatible API. Locally you can use Minio with the official S3
SDK and benefit from the local file system.

## Limitations

For now, only MP4 videos (streamable) are supported by InMotion. One way to
handle non-streamable content is to [re-encode the
video](/server/internal/dvr/pipeline.go#L11-L28) once uploaded to move the moov atom at
the beginning of the file.

## Deployment

First, you'll need:

+ AWS Credentials + a dedicated [S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html)
+ [Rev.AI access token](https://www.rev.ai/docs#section/Quick-Start/Get-your-Access-Token)
+ Auth0 Application credentials:
  - [Single Page Application](https://auth0.com/docs/dashboard/guides/applications/register-app-spa)
  - [Machine-2-machine Application](https://auth0.com/docs/dashboard/guides/applications/register-app-m2://auth0.com/docs/dashboard/guides/applications/register-app-m2m)

This project's API is ready to be deployed on [Heroku](https://www.heroku.com)
 [directly with git](https://devcenter.heroku.com/articles/git).

 Turn on Postgres add-on with:

 ```
 heroku addons:create heroku-postgresql:hobby-dev
 ```

 Then, you'll need to add the following environment variables:

 ```bash
heroku config:set \
APP_URL="" \
AUTH0_AUDIENCE="<Machine-2-machine audience>" \
AUTH0_DOMAIN="<Machine-2-machine domain>" \
AWS_ACCESS_KEY_ID="<AWS_KEY>" \
AWS_REGION="us-east-1" \
AWS_S3_BUCKET="<YOUR_BUCKET>" \
AWS_SECRET_ACCESS_KEY="<YOUR_AWS_ACCESS_KEY>" \
DATABASE_URL="postgres://..." \
GIN_MODE="release"
REVAI_TOKEN="<YOUR_REVAI_TOKEN>"
 ```

The client can be deployed with [Vercel](https://vercel.com) directly from
[CLI](https://vercel.com/download):

```
cd client/
now --production
```

Use the client's URL from Vercel as `CLIENT_URL`:

```bash
heroku config:set CLIENT_URL="<CLIENT_URL>"
```

## Development

### Requirements

+ Docker
+ Go 1.13.x
+ Node v12.13.x

## Installation

You'll need to edit your hosts in order to redirect the `inmotion.dev` on your
localhost.

```bash
sudo bash -c 'cat << EOF >> /etc/hosts
  127.0.0.1 inmotion.dev
  127.0.0.1 api.inmotion.dev
EOF'
```

Then start the dev environment with:
```
docker-compose up
```

In another terminal start the API:
```
cd server/
make run
```

In another terminal start the client:
```
cd client/
npm i
npm run dev
```

Open [https://inmotion.dev](https://inmotion.dev)
