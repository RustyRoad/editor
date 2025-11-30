import type { Editor } from 'grapesjs';
import { COMPONENT_TYPES, Trait } from '../funnel-components';

export function addProgressComponent(editor: Editor): void {
  const domc = editor.DomComponents;

  // Funnel progress indicator component
  domc.addType(COMPONENT_TYPES.PROGRESS, {
    isComponent: el => el.getAttribute?.('data-gjs-type') === COMPONENT_TYPES.PROGRESS,
    model: {
      defaults: {
        tagName: 'div',
        attributes: {
          'data-gjs-type': COMPONENT_TYPES.PROGRESS,
          'class': 'funnel-progress bg-gray-100 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6'
        },
        content: `
          <div class="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-2">
            <span>Step 1 of 3</span>
            <span>Tripwire Offer</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-green-600 h-2 rounded-full" style="width: 33%"></div>
          </div>
        `,
        traits: [
          {
            type: 'number',
            label: 'Current Step',
            name: 'currentStep',
            min: 1,
            max: 10,
            changeProp: true
          },
          {
            type: 'number',
            label: 'Total Steps',
            name: 'totalSteps',
            min: 1,
            max: 10,
            changeProp: true
          },
          {
            type: 'text',
            label: 'Step Name',
            name: 'stepName',
            changeProp: true
          }
        ] as Trait[],
        currentStep: 1,
        totalSteps: 3,
        stepName: 'Tripwire Offer'
      },

      init(this: any) {
        (this as any).listenTo(this, 'change:currentStep change:totalSteps change:stepName', (this as any).updateProgress.bind(this));
        (this as any).updateProgress();
      },

      updateProgress(this: any) {
        const currentStep = (this as any).get('currentStep') || 1;
        const totalSteps = (this as any).get('totalSteps') || 3;
        const stepName = (this as any).get('stepName') || 'Current Step';
        const progressPercent = Math.round((currentStep / totalSteps) * 100);

        (this as any).set('content', `
          <div class="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-2">
            <span>Step ${currentStep} of ${totalSteps}</span>
            <span>${stepName}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-green-600 h-2 rounded-full" style="width: ${progressPercent}%"></div>
          </div>
        `);
      }
    }
  });
}