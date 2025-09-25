import React, { useState } from 'react'
import { useBlockStore } from './blockStore'
import Features from '../features/features';



/*
 * AI CONTEXT: HOW TO USE PROPS FOR REUSABLE INTERACTIVE BLOCKS
 * 
 * When the user wants to create a reusable interactive block, or they ask you to use props, 
 * (games, quizzes, tools, etc.), it's meant to have quizzes where we can easily change the questions, 
 * games where assets can be replaced, charts where the values can be updated, flashcards, anything. 
 * As long as it can be reused for another subject, the AI must define the block props and add default 
 * values that will be used in the game if no props are passed.
 * 
 * Examples of reusable interactive blocks that should use props:
 * - Quizzes: questions, answers, difficulty levels, scoring systems
 * - Games: assets, levels, rules, themes, characters
 * - Charts and flowcharts: data values, labels, colors, chart types
 * - Flashcards: card content, categories, difficulty
 * - Tools: configuration options, templates, presets
 * - Interactive demos: parameters, examples, scenarios
 * - Interactive forms: fields, validation, submission handling
 * - Interactive tables: data, sorting, filtering
 * - Interactive maps: data, markers, layers
 * - Interactive graphs: data, visualization types
 * - Interactive charts: data, visualization types
 * - Interactive diagrams: data, visualization types
 * 
 * The props should make the block adaptable to different subjects and use cases while maintaining
 * the same core functionality and user interface.
 */
interface BlockProps {
  
}

const Block: React.FC = (props: BlockProps) => {
  const { registeredContent } = useBlockStore();
  const [isSpoilerOpen, setIsSpoilerOpen] = useState(false);
  const { data, id } = registeredContent;
  const [selectedImage, setSelectedImage] = useState<any>(null);

  return (
    <div data-mexty-id={`${id}.layout.main`} className={data.layout.main.className}>
      {/* Header Section */}
      <section data-mexty-id={`${id}.header.section`} className={data.header.section.className}>
        <section data-mexty-id={`${id}.header.container`} className={data.header.container.className}>
          <div data-mexty-id={`${id}.header.contentWrapper`} className={data.header.contentWrapper.className}>
            <h1 data-mexty-id={`${id}.header.title`} className={data.header.title.className}>
              {data.header.title.content}
            </h1>
            <p data-mexty-id={`${id}.header.description`} className={data.header.description.className}>
              {data.header.description.content}
            </p>
          </div>
        </section>
      </section>

      {/* About Us Section */}
      <section data-mexty-id={`${id}.aboutUs.section`} className={data.aboutUs.section.className}>
        <div data-mexty-id={`${id}.aboutUs.titleWrapper`} className={data.aboutUs.titleWrapper.className}>
          <h2 data-mexty-id={`${id}.aboutUs.title`} className={data.aboutUs.title.className}>
            {data.aboutUs.title.content}
          </h2>
          <p data-mexty-id={`${id}.aboutUs.description`} className={data.aboutUs.description.className}>
            {data.aboutUs.description.content}
          </p>
          <div data-mexty-id={`${id}.aboutUs.imagesGroup`} className={data.aboutUs.imagesGroup.className}>
            {data.aboutUs.images.map((image: any, index: number) => (
              <img
                data-mexty-id={`${id}.aboutUs.images.${index}`}
                key={index}
                src={image.src}
                alt={image.alt}
                className={image.className}
                onClick={() => selectedImage ? setSelectedImage(null) : setSelectedImage({...image, dataMextyId: `${id}.aboutUs.images.${index}`})}
              />
            ))}
            { /* Here we use the dataMextyId property to reuse the element in the state or share its path in the data store across components */}
             {selectedImage && (
                <p data-mexty-id={`${selectedImage.dataMextyId}.description`} className={selectedImage.description.className}>
                  {selectedImage.description.content}
                </p>
              )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* Testimonials Section */}
      <section data-mexty-id={`${id}.testimonial.section`} className={data.testimonial.section.className}>
        <div data-mexty-id={`${id}.testimonial.container`} className={data.testimonial.container.className}>
          <div data-mexty-id={`${id}.testimonial.contentWrapper`} className={data.testimonial.contentWrapper.className}>
            <h2 data-mexty-id={`${id}.testimonial.title`} className={data.testimonial.title.className}>
              {data.testimonial.title.content}
            </h2>
            <p data-mexty-id={`${id}.testimonial.description`} className={data.testimonial.description.className}>
              {data.testimonial.description.content}
            </p>
            <div data-mexty-id={`${id}.testimonial.testimonialsGroup`} className={data.testimonial.testimonialsGroup.className}>
              {data.testimonial.testimonials.map((testimonial: any, index: number) => (
                <div key={index} data-mexty-id={`${id}.testimonial.testimonials.${index}.container`} className={testimonial.container.className}>
                  <img
                    data-mexty-id={`${id}.testimonial.testimonials.${index}.image`}
                    src={testimonial.image.src}
                    alt={testimonial.image.alt}
                    className={testimonial.image.className}
                  />
                  <div data-mexty-id={`${id}.testimonial.testimonials.${index}.video`} className={testimonial.contentWrapper.className}>
                    <video 
                      data-mexty-id={`${id}.testimonial.testimonials.${index}.video`}
                      src={testimonial.video.src}
                      className={testimonial.video.className}
                      controls
                    />
                  </div>
                  <div data-mexty-id={`${id}.testimonial.testimonials.${index}.link`} className={testimonial.contentWrapper.className}>
                    <a 
                      href={testimonial.link.href}
                      className={testimonial.link.className}
                      data-mexty-id={`${id}.testimonial.testimonials.${index}.link`}
                    >
                      {testimonial.link.content}
                    </a>
                  </div>
                  <div data-mexty-id={`${id}.testimonial.testimonials.${index}.button`} className={testimonial.contentWrapper.className}>
                    <button data-mexty-id={`${id}.testimonial.testimonials.${index}.button`} className={testimonial.button.className} >
                      {testimonial.button.content}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Spoiler Section */}
      <section data-mexty-id={`${id}.spoiler.section`} className={data.spoiler.section.className}>
        <div data-mexty-id={`${id}.spoiler.container`} className={data.spoiler.container.className}>
          <div data-mexty-id={`${id}.spoiler.contentWrapper`} className={data.spoiler.contentWrapper.className}>
            <h2 data-mexty-id={`${id}.spoiler.title`} className={data.spoiler.title.className}>
              {data.spoiler.title.content}
            </h2>
            <p data-mexty-id={`${id}.spoiler.description`} className={data.spoiler.description.className}>
              {data.spoiler.description.content}
            </p>
           
            <button data-mexty-id={`${id}.spoiler.button`} className={data.spoiler.button.className} onClick={() => setIsSpoilerOpen(!isSpoilerOpen)}>
              {data.spoiler.button.content}
            </button>
          </div>
          {isSpoilerOpen && (
            <div data-mexty-id={`${id}.spoiler.spoilerContent`} className={data.spoiler.spoilerContent.container.className}>
              {data.spoiler.spoilerContent.elements.map((element: any, index: number) => (
                <span key={index} data-mexty-id={`${id}.spoiler.spoilerContent.elements.${index}`} className={element.className}>
                  {element.content}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Block
