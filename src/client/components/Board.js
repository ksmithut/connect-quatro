import React from 'react'
import styled from 'styled-components'
import { findWinningLine } from '../lib/connect-quatro.js'

/**
 * @param {object} props
 * @param {(0|1)[][]} props.board
 * @param {(column: number) => void} props.onColumnClick
 * @param {number} [props.height=6]
 */
function Board ({ board, onColumnClick, height = 6 }) {
  const winningLine = React.useMemo(() => {
    const line = findWinningLine(board)
    if (!line) return new Map()
    return line.reduce(
      /**
       * @param {Map<number, Set<number>>} map
       * @param {[number, number]} coordinate
       */
      (map, [col, row]) => {
        const set = map.get(col) ?? new Set()
        set.add(height - 1 - row)
        return map.set(col, set)
      },
      new Map()
    )
  }, [board, height])
  return (
    <BoardWrapper>
      {board.map((column, index) => (
        <Column
          key={index}
          column={column}
          index={index}
          height={height}
          onClick={onColumnClick}
          winningLine={winningLine}
        />
      ))}
    </BoardWrapper>
  )
}

export default Board

const BoardWrapper = styled.div`
  display: flex;
  box-sizing: border-box;
  border-radius: 15px;
  justify-content: center;
  background-color: #0045bc;
  width: 430px;
  padding: 5px;
  border: 3px solid black;
`

/**
 * @param {object} props
 * @param {number[]} props.column
 * @param {number} props.index
 * @param {number} props.height
 * @param {(column: number) => void} props.onClick
 * @param {Map<number, Set<number>>} props.winningLine
 */
function Column ({ column, index, height, onClick, winningLine }) {
  const filledColumn = React.useMemo(() => {
    /** @type {(number|null)[]} */
    const newColumn = column.slice()
    newColumn.length = height
    for (const [index, value] of newColumn.entries()) {
      if (value === undefined) newColumn[index] = null
    }
    return newColumn.reverse()
  }, [column, height])
  const handleClick = React.useCallback(
    e => {
      e.preventDefault()
      if (column.length >= height) return
      onClick(index)
    },
    [column.length, index, onClick]
  )
  return (
    <ColumnWrapper onClick={handleClick}>
      {filledColumn.map((value, row) => (
        <Cell
          winning={winningLine.get(index)?.has(row) ?? false}
          key={row}
          value={value}
        />
      ))}
    </ColumnWrapper>
  )
}

const ColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
`

const COLOR_MAP = new Map([
  [null, '#7089b5'],
  [0, '#edd902'],
  [1, '#f43430']
])

/**
 * @type {import('styled-components').StyledComponent<'div', any, { value: number|null, winning: boolean }, any>}
 */
const Cell = styled.div.attrs(props => ({
  backgroundColor: COLOR_MAP.get(props.value),
  borderColor: props.winning ? '#fff' : '#000'
}))`
  height: 50px;
  width: 50px;
  margin: 5px;
  box-sizing: border-box;
  border-radius: 25px;
  box-shadow: inset 1px 1px 2px #000;
  background-color: ${p => p.backgroundColor};
  border: 3px solid ${p => p.borderColor};
`
