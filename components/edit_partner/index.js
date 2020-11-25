import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import $button from '../button'
import $input from '../input'
import $segmentPicker from '../segment_picker'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $editPartner ({ partnerStreams }) {
  const { lang, model } = useContext(context)

  const { partnerStream, nameStreams, segmentIdsStreams } = useMemo(() => {
    const partnerStream = partnerStreams.pipe(rx.switchAll())

    const nameStreams = new Rx.ReplaySubject(1)
    nameStreams.next(partnerStream.pipe(rx.map((partner) => partner?.name)))

    const segmentIdsStreams = new Rx.ReplaySubject(1)
    segmentIdsStreams.next(partnerStream.pipe(rx.map((partner) =>
      partner.data?.impact?.segmentIds || []
    )))

    return {
      partnerStream,
      nameStreams,
      segmentIdsStreams
    }
  }, [])

  const { name, partner, segmentIds } = useStream(() => ({
    name: nameStreams.pipe(rx.switchAll()),
    partner: partnerStream,
    segmentIds: segmentIdsStreams.pipe(rx.switchAll())
  }))

  const save = () => {
    model.partner.upsert({
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
    z($button, {
      onclick: save,
      isPrimary: true,
      text: lang.get('general.save'),
      isFullWidth: false
    })
  ])
}
