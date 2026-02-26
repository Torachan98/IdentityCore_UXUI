import NotificationToast from '@/components/atoms/NotificationToast.vue'
import { h } from 'vue'
import { toast } from 'vue3-toastify'

type Props = {
  title: string
  message: string
  icon?: string
}

export const onToast = ({ title, message, icon }: Props) => {
  toast(
    h(NotificationToast, {
      title: title,
      message: message,
      icon: icon ?? 'bell',
    }),
    {
      autoClose: 5000,
      closeButton: false,
      hideProgressBar: false,
      position: toast.POSITION.BOTTOM_RIGHT,
    },
  )
}
