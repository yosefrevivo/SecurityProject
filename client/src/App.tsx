import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios'
import { MantineProvider, Button, AppShell, Navbar, Header, Code } from '@mantine/core';
import { FilesList } from './components/FilesList';
import { CodeArea } from './components/CodeArea';
import { AppHeader } from './components/AppHeader';


function App() {
  const [getMessage, setGetMessage] = useState<any>({})

  React.useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => setGetMessage(data.message));
  }, []);

  // useEffect(()=>{
  //   axios.get('http://localhost:3001/api').then(response => {
  //     console.log("SUCCESS", response)
  //     setGetMessage(response.massage)
  //   }).catch(error => {
  //     console.log(error)
  //   })

  // }, [])
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: 'dark' }}>
      <AppShell
        padding="md"
        navbar={<Navbar width={{ base: 300 }} height={500} p="xs"><FilesList></FilesList></Navbar>}
        header={<AppHeader></AppHeader>}
        styles={(theme) => ({
          main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
      })}
      >
        {<CodeArea></CodeArea>}
      </AppShell>
    </MantineProvider>
  );
}

export default App;