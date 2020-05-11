import React, { useState } from 'react';
import Router from 'next/router';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { LocaleProvider } from 'baseui';
import { FileUploader } from 'baseui/file-uploader';

const localOverride = {
  fileuploader: {
    dropFilesToUpload: 'Drop video here to upload',
    or: 'or',
    browseFiles: 'Browse files',
    retry: 'Retry upload',
    cancel: 'Cancel',
  },
};
const ERROR_MSG = 'An error occured... Please try again';

const GENERATE_VIDEO_UPLOAD_URL = gql`
  mutation generateVideoUploadURL($name: String!, $type: String!, $size: Int!) {
    generateVideoUploadURL(name: $name, type: $type, size: $size) {
      id
      url
    }
  }
`;

const CREATE_EDITION = gql`
  mutation createEdition($input: EditionInput!) {
    createEdition(input: $input) {
      id
    }
  }
`;

const Editions: React.FC = () => {
  const [generateVideoUploadURL] = useMutation(GENERATE_VIDEO_UPLOAD_URL);
  const [createEdition] = useMutation(CREATE_EDITION);

  const [progressAmount, setProgressAmount] = useState<number>(0);
  const [cancelUpload, setCancelUpload] = useState<() => void>(() => {});
  const [errUpload, setErrUpload] = useState<string>('');

  const onSubmit = async (acceptedFiles) => {
    const res = await generateVideoUploadURL({
      variables: {
        name: acceptedFiles[0].name,
        type: acceptedFiles[0].type,
        size: acceptedFiles[0].size,
      },
    });
    const { url, id: vid } = res.data.generateVideoUploadURL;

    var xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Content-type', 'video/mp4');
    xhr.addEventListener('error', (e) => {
      setErrUpload(ERROR_MSG);
    });
    xhr.upload.addEventListener('progress', (e) => {
      setProgressAmount((e.loaded / e.total) * 100);
    });
    xhr.upload.addEventListener('error', (e) => {
      setErrUpload(ERROR_MSG);
    });
    xhr.onload = async () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const res = await createEdition({
          variables: {
            input: {
              vid: vid,
            },
          },
        });

        if (res.data.createEdition.id) {
          Router.push(
            '/project/[eid]',
            `/project/${res.data.createEdition.id}`,
          );
        }
      } else {
        setErrUpload(ERROR_MSG);
      }
    };
    const cancel = () => {
      xhr.abort();
      // TODO Delete video graph
      setProgressAmount(0);
      setErrUpload('');
    };

    setCancelUpload(() => {
      return cancel;
    });
    xhr.send(acceptedFiles[0]);
  };

  return (
    <LocaleProvider locale={localOverride}>
      <FileUploader
        accept="video/mp4"
        onCancel={cancelUpload}
        onDrop={onSubmit}
        onRetry={cancelUpload}
        progressAmount={progressAmount}
        progressMessage={
          progressAmount
            ? `Uploading... ${progressAmount.toFixed(2)}% of 100%`
            : ''
        }
        errorMessage={errUpload}
      />
    </LocaleProvider>
  );
};

export default Editions;
