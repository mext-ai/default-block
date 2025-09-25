import React from 'react'
import { useFeatureStore } from './featuresStore'

const Features: React.FC = () => {
  const { registeredContent } = useFeatureStore();
  const { data, id } = registeredContent;


  return (
    <section data-mexty-id={`${id}.features.section`} className={data.features.section.className}>
      <div data-mexty-id={`${id}.features.container`} className={data.features.container.className}>
        <div data-mexty-id={`${id}.features.contentWrapper`} className={data.features.contentWrapper.className}>
          <h2 data-mexty-id={`${id}.features.title`} className={data.features.title.className}>
            {data.features.title.content}
          </h2>
          <p data-mexty-id={`${id}.features.description`} className={data.features.description.className}>
            {data.features.description.content}
          </p>
          <div data-mexty-id={`${id}.features.featuresGroup`} className={data.features.featuresGroup.className}>
            {data.features.features.map((feature: any, index: number) => (
              <div key={index} data-mexty-id={`${id}.features.features.${index}`} className={feature.container.className}>
                <h3 data-mexty-id={`${id}.features.features.${index}.title`} className={feature.title.className}>
                  {feature.title.content}
                </h3>
                <p data-mexty-id={`${id}.features.features.${index}.description`} className={feature.description.className}>
                  {feature.description.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
