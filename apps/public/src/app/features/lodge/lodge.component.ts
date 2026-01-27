import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-lodge',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="lodge-container">
      <header class="lodge-header">
        <span class="eyebrow">Destination</span>
        <h1>Naledi Game Lodge</h1>
        <p class="subtitle">
          A hidden gem in South Africa's Limpopo Province
        </p>
      </header>

      <div class="content-grid">
        <section class="content-section">
          <h2>About the Lodge</h2>
          <p>
            Nestled in the heart of the Waterberg Biosphere Reserve, Naledi Game Lodge
            offers an authentic African safari experience. The lodge provides intimate
            encounters with the Big Five and countless other species in their natural habitat.
          </p>
          <p>
            With its stunning landscapes and diverse wildlife, Naledi has become a
            photographer's paradise, offering unique opportunities to capture Africa's
            most iconic animals in breathtaking settings.
          </p>
        </section>

        <section class="content-section">
          <h2>The Wildlife</h2>
          <p>
            The reserve is home to an incredible variety of wildlife, including elephants,
            lions, leopards, rhinos, and buffalo. Beyond the Big Five, you'll encounter
            giraffes, zebras, wildebeest, hippos, and over 300 species of birds.
          </p>
          <p>
            Game drives at Naledi offer both morning and evening safari experiences,
            maximizing your chances of witnessing extraordinary wildlife moments and
            capturing stunning photographs.
          </p>
        </section>

        <section class="content-section">
          <h2>Location</h2>
          <p>
            Naledi Game Lodge is located in the Welgevonden Game Reserve, approximately
            three hours north of Johannesburg. The reserve spans over 35,000 hectares of
            pristine African bushveld, offering a true wilderness experience.
          </p>
        </section>
      </div>

      <div class="cta-section">
        <a
          mat-flat-button
          href="https://naledigamelodges.com"
          target="_blank"
          rel="noopener noreferrer"
          class="cta-button"
        >
          <mat-icon>open_in_new</mat-icon>
          Visit Naledi Game Lodge
        </a>
      </div>
    </div>
  `,
  styles: `
    .lodge-container {
      padding: 3rem 1.5rem;
      max-width: 900px;
      margin: 0 auto;
    }

    .lodge-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .eyebrow {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--color-ochre);
      margin-bottom: 0.75rem;
    }

    .lodge-header h1 {
      margin: 0 0 1rem;
      color: var(--color-text);
    }

    .subtitle {
      font-size: 1.25rem;
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.5;
    }

    .content-grid {
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    .content-section h2 {
      font-size: 1.5rem;
      margin: 0 0 1.25rem;
      color: var(--color-ochre);
      position: relative;
      padding-left: 1rem;
    }

    .content-section h2::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.15em;
      bottom: 0.15em;
      width: 3px;
      background: var(--color-ochre);
      border-radius: 2px;
    }

    .content-section p {
      font-size: 1.1rem;
      line-height: 1.85;
      color: var(--color-text-secondary);
      margin: 0 0 1rem;
    }

    .content-section p:last-child {
      margin-bottom: 0;
    }

    .cta-section {
      text-align: center;
      padding: 3rem 0;
      margin-top: 2rem;
      border-top: 1px solid var(--color-border);
    }

    .cta-button {
      background: var(--color-ochre) !important;
      color: #fff !important;
      padding: 0.75rem 2rem !important;
      font-size: 1rem !important;
    }

    .cta-button mat-icon {
      margin-right: 0.5rem;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    @media (max-width: 600px) {
      .lodge-container {
        padding: 2rem 1rem;
      }

      .lodge-header {
        margin-bottom: 3rem;
      }

      .content-grid {
        gap: 2.5rem;
      }
    }
  `,
})
export class LodgeComponent {}
