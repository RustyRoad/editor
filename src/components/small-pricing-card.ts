import { Editor } from 'grapesjs';
import { formatPrice } from './components'; // Assuming formatPrice is available

export default (editor: Editor) => {
  const domc = editor.DomComponents;

  domc.addType('small-pricing-card', {
    isComponent: el => el.getAttribute && el.getAttribute('data-gjs-type') === 'small-pricing-card',
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-gjs-type': 'small-pricing-card', class: 'pricing-table-card bg-white dark:bg-gray-900 hover:bg-gray-50 dark:bg-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col basis-1/3 max-w-1/3 min-w-[250px] flex-1' },
        components: [
          // Structure will be built by updateComponents
        ],
        droppable: false,
        stylable: true,
        traits: [
          {
            type: 'textarea',
            label: 'Message',
            name: 'message',
            changeProp: true
          },
          {
            type: 'text',
            label: 'Button Text',
            name: 'buttonText',
            changeProp: true
          },
          {
            type: 'hidden',
            name: 'serviceId',
            changeProp: true
          },
          {
            type: 'hidden',
            name: 'serviceData', // Store full service data for modal
            changeProp: true
          }
        ],
        message: 'Not sure you wanna subscribe? Try one time here.',
        buttonText: 'Try Now',
        serviceId: '',
        serviceData: null,
      },

      init() {
        this.listenTo(this, 'change:message change:buttonText change:serviceId change:serviceData', this.updateComponents);
        setTimeout(() => this.updateComponents(), 0);
      },

      updateComponents() {
        const message = this.get('message');
        const buttonText = this.get('buttonText');
        const serviceId = this.get('serviceId');
        const serviceData = this.get('serviceData');

        this.empty(); // Clear existing content

        // Add message paragraph
        this.append({
          tagName: 'p',
          attributes: { class: 'text-gray-600 dark:text-gray-300 dark:text-gray-300 mb-4 flex-grow' },
          content: message
        });

        // Add button
        const buttonComp = this.append({
          tagName: 'button',
          attributes: { class: 'pricing-table-button gjs-pricing-buy-button w-full rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-2 text-white font-medium transition-colors duration-300' },
          content: buttonText
        })[0]; // append returns an array, get the first component

        // Add data-service attribute to the button
        if (buttonComp && serviceData) {
             // Ensure serviceData is a stringified JSON object
            const dataServiceAttr = typeof serviceData === 'string' ? serviceData : JSON.stringify(serviceData);
            buttonComp.addAttributes({ 'data-service': dataServiceAttr });
        } else if (buttonComp) {
             // If no serviceData, remove the attribute or set to empty
             buttonComp.addAttributes({ 'data-service': '' });
        }
      },
    },
    view: {
      // GrapesJS handles rendering based on the model's 'components' and 'content'
    }
  });
};