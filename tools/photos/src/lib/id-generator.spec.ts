import { generateStableId } from './id-generator';
import * as path from 'path';
import * as fs from 'fs/promises';

describe('generateStableId', () => {
  const testImagePath = path.join(__dirname, '../../../../test-fixtures/test.jpg');

  it('should generate a 20 character hex string', async () => {
    const exists = await fs.access(testImagePath).then(() => true).catch(() => false);
    if (!exists) {
      console.log('Skipping test: no test fixture available');
      return;
    }

    const id = await generateStableId(testImagePath);
    expect(id).toMatch(/^[a-f0-9]{20}$/);
  });

  it('should produce the same ID for the same image', async () => {
    const exists = await fs.access(testImagePath).then(() => true).catch(() => false);
    if (!exists) {
      console.log('Skipping test: no test fixture available');
      return;
    }

    const id1 = await generateStableId(testImagePath);
    const id2 = await generateStableId(testImagePath);
    expect(id1).toBe(id2);
  });
});
