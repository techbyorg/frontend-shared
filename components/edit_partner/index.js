import { z, useContext, useMemo, useStream } from 'zorium'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import $input from '../input'
import $segmentPicker from '../../../src/components/segment_picker' // FIXME
import $unsavedSnackBar from '../unsaved_snack_bar'
import { streams } from '../../services/obs'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $editPartner ({ partnerStreams }) {
  const { lang, model } = useContext(context)

  const {
    partnerStream, nameStreams, segmentIdsStreams
  } = useMemo(() => {
    const partnerStream = partnerStreams.stream

    const nameStreams = streams(
      partnerStream.pipe(rx.map((partner) => partner?.name))
    )

    const segmentIdsStreams = streams(partnerStream.pipe(rx.map((partner) =>
      partner?.data?.impact?.segmentIds || []
    )))

    return {
      partnerStream,
      nameStreams,
      segmentIdsStreams
    }
  }, [])

  const { name, partner, segmentIds } = useStream(() => ({
    name: nameStreams.stream,
    partner: partnerStream,
    segmentIds: segmentIdsStreams.stream
  }))

  const reset = () => {
    nameStreams.reset()
    segmentIdsStreams.reset()
  }

  const save = () => {
    return model.partner.upsert({
      id: partner.id,
      slug: partner.slug,
      name,
      data: _.defaultsDeep({
        impact: {
          segmentIds
        }
      }, partner.data)
    })
  }

  const isUnsaved = nameStreams.isChanged() || segmentIdsStreams.isChanged()

  return z('.z-edit-partner', [
    z('.title', lang.get('general.partners')),
    z('.description', lang.get('editPartner.description')),
    z('.input', [
      z($input, {
        valueStreams: nameStreams,
        placeholder: lang.get('editPartner.partnerName'),
        disabled: partner?.slug === 'everyone'
      })
    ]),
    z('.input', [
      z('.label', lang.get('editPartner.segmentIds')),
      z($segmentPicker, { segmentIdsStreams })
    ]),
    isUnsaved && z($unsavedSnackBar, {
      onCancel: reset,
      onSave: save
    })
  ])
}
