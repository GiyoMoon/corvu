import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
} from 'solid-js'
import { access } from '@lib/utils'
import type { MaybeAccessor } from 'src'

/**
 * Creates a presence which is aware of css animations and waits for them to finish before changing changing it's state to `hidden`.
 *
 * @param props.show - Whether the presence is showing or not.
 * @param props.element - The element which animations should be tracked.
 * @returns ```typescript
 * {
 *   present: Accessor<boolean>
 *   state: Accessor<'present' | 'hiding' | 'hidden'>
 * }
 * ```
 */
const createPresence = (props: {
  show: MaybeAccessor<boolean>
  element: MaybeAccessor<HTMLElement | null>
}): {
  present: Accessor<boolean>
  state: Accessor<'present' | 'hiding' | 'hidden'>
} => {
  const refStyles = createMemo(() => {
    const element = access(props.element)
    if (!element) return
    return getComputedStyle(element)
  })

  const [presentState, setPresentState] = createSignal<
    'present' | 'hiding' | 'hidden'
    // eslint-disable-next-line solid/reactivity
  >(access(props.show) ? 'present' : 'hidden')

  let animationName = ''

  createEffect((prevShow) => {
    const show = access(props.show)

    untrack(() => {
      if (prevShow === show) return show

      const prevAnimationName = animationName
      const currentAnimationName = getAnimationName()

      if (show) {
        setPresentState('present')
      } else if (
        currentAnimationName === 'none' ||
        refStyles()?.display === 'none'
      ) {
        setPresentState('hidden')
      } else {
        const isAnimating = prevAnimationName !== currentAnimationName

        if (prevShow && isAnimating) {
          setPresentState('hiding')
        } else {
          setPresentState('hidden')
        }
      }
    })

    return show
  })

  createEffect(() => {
    const element = access(props.element)

    if (!element) {
      untrack(() => {
        if (presentState() === 'hiding') {
          setPresentState('hidden')
        }
      })
      return
    }

    const handleAnimationStart = (event: AnimationEvent) => {
      if (event.target === element) {
        animationName = getAnimationName()
      }
    }

    const handleAnimationEnd = (event: AnimationEvent) => {
      const currentAnimationName = getAnimationName()
      const isCurrentAnimation = currentAnimationName.includes(
        event.animationName,
      )
      if (
        event.target === element &&
        isCurrentAnimation &&
        presentState() === 'hiding'
      ) {
        setPresentState('hidden')
      }
    }

    element.addEventListener('animationstart', handleAnimationStart)
    element.addEventListener('animationcancel', handleAnimationEnd)
    element.addEventListener('animationend', handleAnimationEnd)

    onCleanup(() => {
      element.removeEventListener('animationstart', handleAnimationStart)
      element.removeEventListener('animationcancel', handleAnimationEnd)
      element.removeEventListener('animationend', handleAnimationEnd)
    })
  })

  const getAnimationName = () => {
    return refStyles()?.animationName ?? 'none'
  }

  return {
    present: () => presentState() === 'present' || presentState() === 'hiding',
    state: presentState,
  }
}

export default createPresence
