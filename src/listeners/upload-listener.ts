import {
    Client,
    FlatfileVirtualMachine,
    FlatfileEvent,
  } from '@flatfile/listener';
  
  const UploadListener = Client.create((client) => {
    /**
     * This is a basic hook on events with no sugar on top
     */
  
    client.on(
      'upload:*', //listens for upload:completed
      (event: FlatfileEvent) => {
        console.log('upload completed: ' + JSON.stringify(event));
        //do something here
      }
    );
  
    /**
     * This deploys the agent to the Environment.
     * Note it will override agents/custom actions in your environment.
     * Suggest using isolated Environment when using listener
     */
    client.on('client:init', async (event) => {
      //deploys the agent
      console.log(
        'Deployed Agent to environment: ' + JSON.stringify(event.context)
      );
    });
  });
  
  const FlatfileVM = new FlatfileVirtualMachine();
  
  UploadListener.mount(FlatfileVM);
  
  export default UploadListener;
  