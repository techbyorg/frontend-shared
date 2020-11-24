import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import $button from '../button'
import $input from '../input'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $editPartner ({ partnerStreams }) {
  const { lang, model } = useContext(context)

  const { partnerStream, nameStreams } = useMemo(() => {
    const partnerStream = partnerStreams.pipe(rx.switchAll())

    const nameStreams = new Rx.ReplaySubject(1)
    nameStreams.next(partnerStream.pipe(rx.map((partner) => partner?.name)))

    return {
      partnerStream,
      nameStreams
    }
  }, [])

  const { name, partner } = useStream(() => ({
    name: nameStreams.pipe(rx.switchAll()),
    partner: partnerStream
  }))

  const save = () => {
    model.partner.upsert({ id: partner.id, slug: partner.slug, name })
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
    z($button, {
      onclick: save,
      isPrimary: true,
      text: lang.get('general.save'),
      isFullWidth: false
    })
  ])
}
