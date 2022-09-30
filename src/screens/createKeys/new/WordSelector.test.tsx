import React from 'react'
import {
  render,
  waitFor,
  fireEvent,
  cleanup,
} from '@testing-library/react-native'

import { WordSelector } from './WordSelector'
import { getTextFromTextNode } from '../../../../testLib/utils'

describe('Word Selector', function () {
  afterEach(cleanup)

  it('renders', async () => {
    const { getByTestId } = await waitFor(() =>
      render(
        <WordSelector
          expectedWord="one"
          wordIndex={0}
          onWordSelected={() => {}}
        />,
      ),
    )

    expect(getTextFromTextNode(getByTestId('view.indexLabel'))).toContain('1')
  })

  test('show options', async () => {
    const { getByTestId } = await waitFor(() =>
      render(
        <WordSelector
          expectedWord="one"
          wordIndex={0}
          onWordSelected={() => {}}
        />,
      ),
    )
    const input = getByTestId('input.wordInput')
    fireEvent.changeText(input, 'on')
    expect(getTextFromTextNode(getByTestId('view.option.0'))).toContain('once')
    fireEvent.changeText(input, 't')
    expect(getTextFromTextNode(getByTestId('view.option.0'))).toContain('table')
    expect(getTextFromTextNode(getByTestId('view.option.1'))).toContain(
      'tackle',
    )
  })

  test('select correct word', async () => {
    const onWordSelected = jest.fn()
    const { getByTestId } = await waitFor(() =>
      render(
        <WordSelector
          expectedWord="table"
          wordIndex={2}
          onWordSelected={onWordSelected}
        />,
      ),
    )
    const input = getByTestId('input.wordInput')

    fireEvent.changeText(input, 't')
    expect(getTextFromTextNode(getByTestId('view.option.0'))).toContain('table')
    fireEvent.press(getByTestId('view.option.0'))

    expect(onWordSelected).toBeCalledWith('table', 2)
  })

  test('select incorrect word', async () => {
    const { getByTestId, queryByTestId } = await waitFor(() =>
      render(
        <WordSelector
          expectedWord="one"
          wordIndex={2}
          onWordSelected={() => {}}
        />,
      ),
    )
    const input = getByTestId('input.wordInput')

    fireEvent.changeText(input, 't')
    expect(getByTestId('deleteIcon')).toBeDefined()
    expect(queryByTestId('checkIcon')).toBeNull()
    fireEvent.press(getByTestId('view.option.0'))
    expect(getByTestId('deleteIcon')).toBeDefined()
    expect(queryByTestId('checkIcon')).toBeNull()
  })
})