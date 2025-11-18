import { sha256Hex, merkleRoot } from '../crypto-utils'

type Proof = { leaf: string, siblings: string[], flags: ('L'|'R')[] }

async function makeProof(leaves: string[], index: number): Promise<Proof> {
  let siblings: string[] = []
  let flags: ('L'|'R')[] = []
  let level = leaves.slice()
  let pos = index
  while (level.length > 1) {
    const isRight = pos % 2 === 1
    const siblingIndex = isRight ? pos - 1 : pos + 1
    const sib = level[siblingIndex] ?? level[pos]
    siblings.push(sib)
    flags.push(isRight ? 'R' : 'L')
    const next: string[] = []
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]
      const right = level[i + 1] ?? left
      next.push(await sha256Hex(left + right))
    }
    level = next
    pos = Math.floor(pos / 2)
  }
  return { leaf: leaves[index], siblings, flags }
}

async function verifyProof(p: Proof, root: string): Promise<boolean> {
  let acc = p.leaf
  for (let i = 0; i < p.siblings.length; i++) {
    const sib = p.siblings[i]
    const dir = p.flags?.[i] || 'L'
    acc = await sha256Hex(dir === 'L' ? acc + sib : sib + acc)
  }
  return acc === root
}

test('tampered siblings fail verification', async () => {
  const leaves = ['a','b','c','d'].map(x=>Buffer.from(x).toString('hex'))
  const root = await merkleRoot(leaves)
  const p = await makeProof(leaves, 1)
  p.siblings[0] = Buffer.from('x').toString('hex')
  const ok = await verifyProof(p, root)
  expect(ok).toBe(false)
})

test('wrong order fails verification', async () => {
  const leaves = ['a','b','c','d'].map(x=>Buffer.from(x).toString('hex'))
  const root = await merkleRoot(leaves)
  const p = await makeProof(leaves, 2)
  p.flags[0] = p.flags[0] === 'L' ? 'R' : 'L'
  const ok = await verifyProof(p, root)
  expect(ok).toBe(false)
})

test('odd-leaf duplication handled, altered leaf fails', async () => {
  const leaves = ['a','b','c'].map(x=>Buffer.from(x).toString('hex'))
  const root = await merkleRoot(leaves)
  const p = await makeProof(leaves, 2)
  p.leaf = Buffer.from('z').toString('hex')
  const ok = await verifyProof(p, root)
  expect(ok).toBe(false)
})
