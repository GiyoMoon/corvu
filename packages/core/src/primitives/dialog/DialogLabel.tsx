import Polymorphic, { PolymorphicAttributes } from '@lib/components/Polymorphic'
import { useInternalDialogContext } from '@primitives/dialog/DialogContext'
import { splitProps } from 'solid-js'
import type { OverrideComponentProps } from '@lib/types'
import type { ValidComponent } from 'solid-js'

const DEFAULT_DIALOG_LABEL_ELEMENT = 'h2'

export type DialogLabelProps<
  T extends ValidComponent = typeof DEFAULT_DIALOG_LABEL_ELEMENT,
> = OverrideComponentProps<T, PolymorphicAttributes<T>>

/** Label element to announce the dialog to accessibility tools.
 *
 * @data `data-corvu-dialog-label` - Present on every dialog label element.
 */
const DialogLabel = <
  T extends ValidComponent = typeof DEFAULT_DIALOG_LABEL_ELEMENT,
>(
  props: DialogLabelProps<T>,
) => {
  const { labelId } = useInternalDialogContext()

  const [localProps, otherProps] = splitProps(props, ['as'])

  return (
    <Polymorphic
      as={localProps.as ?? (DEFAULT_DIALOG_LABEL_ELEMENT as ValidComponent)}
      id={labelId()}
      data-corvu-dialog-label
      {...otherProps}
    />
  )
}

export default DialogLabel
