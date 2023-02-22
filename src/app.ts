import { Flatfile, FlatfileClient } from '@flatfile/api-beta';

void main();

async function main() {
  const flatfile = new FlatfileClient({
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
  });

  const newSpace = await flatfile.spaces.create({
    spaceConfigId: 'space-config-id',
    environmentId: 'my-environment-id',
    name: 'My space!',
  });

  console.log('Created space', newSpace);

  const environment = await flatfile.environments.create({
    name: 'dev',
    isProd: false,
    newSpacesInherit: false,
    guestAuthentication: [Flatfile.GuestAuthentication.SharedLink],
  });

  console.log('Created environment', environment);

  const sheet = await flatfile.sheets.get('workbook-id', 'sheet-id');

  console.log('Got sheet!', sheet);

  const event = await flatfile.events.get(environment.id, 'event-id');

  console.log('Got event!', event);
}