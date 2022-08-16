import { Prism } from '@mantine/prism';

const demoCode = `import { Button } from '@mantine/core';

function Demo() {
  return <Button>Hello</Button>
}`;

export function CodeArea() {
  return (
    <div>
      <Prism withLineNumbers language="javascript"
        copyLabel="Copy code to clipboard"
        copiedLabel="Code copied to clipboard"
      >
        {demoCode}
      </Prism>
    </div>
  );
}