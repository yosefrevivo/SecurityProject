import React from 'react';
import { ThemeIcon, UnstyledButton, Group, Text } from '@mantine/core';
import { FileButton } from './FileButton';
import { BsFileEarmarkCode } from 'react-icons/bs';

export function FilesList() {
  return (
    <Group>
        <FileButton icon={<BsFileEarmarkCode></BsFileEarmarkCode>} color={'green'} label={'FileName1.js'} />
        <FileButton icon={<BsFileEarmarkCode></BsFileEarmarkCode>} color={'blue'} label={'FileName2.css'} />
        <FileButton icon={<BsFileEarmarkCode></BsFileEarmarkCode>} color={'red'} label={'FileName3.html'} />
    </Group>
  );
}