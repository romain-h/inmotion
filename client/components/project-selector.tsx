import React, { useState, useEffect } from 'react';
import gql from 'graphql-tag';
import Router from 'next/router';
import { useQuery } from '@apollo/react-hooks';
import { Select, Value } from 'baseui/select';

const GET_ALL_VIDEOS = gql`
  {
    videos {
      id
      title
      editions {
        id
        title
      }
    }
  }
`;

const ProjectSelector: React.FC = () => {
  const [value, setValue] = useState<Value>([]);
  const { loading, error, data } = useQuery(GET_ALL_VIDEOS);

  useEffect(() => {
    if (value[0]) {
      Router.push('/project/[eid]', `/project/${value[0].id}`);
    }
  }, [value]);

  if (error) return <p>Error :(</p>;

  return (
    <Select
      placeholder="Select an existing project"
      options={
        data
          ? data.videos
              .map((vid) => {
                return vid.editions.map((ed) => ({
                  ...ed,
                  title: `${vid.title}`,
                }));
              })
              .flat()
          : []
      }
      labelKey="title"
      valueKey="id"
      isLoading={loading}
      onChange={({ value }) => setValue(value)}
      value={value}
      searchable={false}
    />
  );
};

export default ProjectSelector;
