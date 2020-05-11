import React from 'react';
import { Block } from 'baseui/block';
import { Label2 } from 'baseui/typography';
import Header from 'components/layout/header';
import { Content } from 'components/ui/content';
import { Divider } from 'components/ui/icon/divider';
import ProtectedPage from 'components/protected-page';
import UploadForm from 'components/upload-form';
import ProjectSelector from 'components/project-selector';

export default () => (
  <ProtectedPage>
    <Header
      renderTitle={() => (
        <Block display="flex" alignItems="center">
          <Divider color="borderOpaque" size="scale1000" />
          <Label2>My projects</Label2>
        </Block>
      )}
    />
    <Content>
      <Block
        display="flex"
        flexDirection="column"
        justifyContent="center"
        marginTop="scale1600"
      >
        <ProjectSelector />
        <Label2
          marginLeft="auto"
          marginRight="auto"
          marginTop="scale800"
          marginBottom="scale800"
        >
          or
        </Label2>
        <UploadForm />
      </Block>
    </Content>
  </ProtectedPage>
);
